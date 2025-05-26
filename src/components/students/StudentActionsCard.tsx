
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from 'lucide-react';

interface StudentActionsCardProps {
  onEditClick: () => void;
  onDelete: () => void;
}

const StudentActionsCard: React.FC<StudentActionsCardProps> = ({ onEditClick, onDelete }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Actions</CardTitle>
        <CardDescription>Manage student profile and data</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Student
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Student
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the student and all
                associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default StudentActionsCard;
