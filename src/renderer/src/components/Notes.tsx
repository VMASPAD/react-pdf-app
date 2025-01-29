import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Dexie from 'dexie';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

// Initialize the database
const db = new Dexie('NotesDB');
db.version(1).stores({
  notes: '++id,title,content,createdAt,updatedAt'
});

type Note = {
  id?: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
};

const Notes: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Fetch notes from IndexedDB using live query
  const notes = useLiveQuery(() => db.notes.orderBy('createdAt').reverse().toArray(), []);

  // Add a new note to the database
  const addNote = async () => {
    if (title.trim() && content.trim()) {
      await db.notes.add({ title, content, createdAt: new Date() });
      setTitle('');
      setContent('');
    }
  };

  // Update a note in the database
  const updateNote = async () => {
    if (editingNote && editingNote.id) {
      await db.notes.update(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        updatedAt: new Date()
      });
      setEditingNote(null);
    }
  };

  // Delete a note from the database
  const deleteNote = async (id: number) => {
    await db.notes.delete(id);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notes</h1>
      <p>
              <Link to={'/'}>Volver al editor</Link>
              </p>
      <div className="mb-4">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-2 mb-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        ></Textarea>
        <Button
          onClick={addNote}
          className="mt-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600"
        >
          Add Note
        </Button>
      </div>

      <div>
        {notes?.length ? (
          <ul className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle>{note.title}</CardTitle>
                  <CardDescription>
                    Created: {note.createdAt.toLocaleString()}
                    {note.updatedAt && (
                      <span> | Updated: {note.updatedAt.toLocaleString()}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>{note.content}</CardContent>
                <CardFooter className="grid grid-cols-2">
                  <Button
                    onClick={() => note.id && deleteNote(note.id)}
                    className="bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Delete
                  </Button>
                  <Dialog>
                    <DialogTrigger>
                      <Button>Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Note</DialogTitle>
                        <DialogDescription>
                          <Input
                            type="text"
                            value={editingNote?.id === note.id ? editingNote.title : note.title}
                            onChange={(e) =>
                              setEditingNote((prev) =>
                                prev && prev.id === note.id
                                  ? { ...prev, title: e.target.value }
                                  : { ...note, title: e.target.value }
                              )
                            }
                            placeholder="Title"
                            className="w-full p-2 mb-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <Textarea
                            value={editingNote?.id === note.id ? editingNote.content : note.content}
                            onChange={(e) =>
                              setEditingNote((prev) =>
                                prev && prev.id === note.id
                                  ? { ...prev, content: e.target.value }
                                  : { ...note, content: e.target.value }
                              )
                            }
                            placeholder="Content"
                            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                          ></Textarea>
                          <Button
                            onClick={updateNote}
                            className="mt-2 px-4 py-2 bg-gray-200 text-white font-semibold rounded shadow hover:bg-green-600"
                          >
                            Save
                          </Button>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No notes yet. Start by adding one!</p>
        )}
      </div>
    </div>
  );
};

export default Notes;
