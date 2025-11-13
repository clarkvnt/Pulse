import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus } from 'lucide-react';

interface AddColumnDialogProps {
  onAddColumn: (title: string, color: string) => void;
}

export function AddColumnDialog({ onAddColumn }: AddColumnDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddColumn(title.trim(), 'gray');
      setTitle('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex-shrink-0 w-80 h-auto py-12 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-transparent text-slate-400 hover:text-slate-600"
        >
          <Plus className="h-4 w-4" />
          Add column
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>New Column</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="column-title">Title</Label>
            <Input
              id="column-title"
              placeholder="Column name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-slate-200"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">Add Column</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
