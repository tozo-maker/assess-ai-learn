
import React from 'react';
import { useForm } from 'react-hook-form';
import { validationService, StudentSchema } from '@/services/validation-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { z } from 'zod';

type StudentFormData = z.infer<typeof StudentSchema>;

interface ValidatedStudentFormProps {
  onSubmit: (data: StudentFormData) => void;
  initialData?: Partial<StudentFormData>;
  isLoading?: boolean;
}

const ValidatedStudentForm: React.FC<ValidatedStudentFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<StudentFormData>({
    defaultValues: initialData,
    mode: 'onChange'
  });

  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);
  const [validationSuccess, setValidationSuccess] = React.useState(false);

  const watchedValues = watch();

  // Real-time validation
  React.useEffect(() => {
    const validateData = () => {
      const result = validationService.validateStudent(watchedValues);
      
      if (result.success) {
        setValidationErrors([]);
        setValidationSuccess(true);
      } else {
        setValidationErrors(result.errors || []);
        setValidationSuccess(false);
      }
    };

    // Debounce validation
    const timeoutId = setTimeout(validateData, 300);
    return () => clearTimeout(timeoutId);
  }, [watchedValues]);

  const handleFormSubmit = (data: StudentFormData) => {
    const result = validationService.validateAndSanitize(data, StudentSchema);
    
    if (result.success) {
      onSubmit(result.data);
    } else {
      setValidationErrors(result.errors || ['Validation failed']);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Student Information
          {validationSuccess && <CheckCircle className="h-4 w-4 text-green-600" />}
          {validationErrors.length > 0 && <AlertCircle className="h-4 w-4 text-red-600" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Validation Errors</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                {...register('first_name')}
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                {...register('last_name')}
                className={errors.last_name ? 'border-red-500' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Grade Level */}
          <div className="space-y-2">
            <Label htmlFor="grade_level">
              Grade Level <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => setValue('grade_level', value as any)}>
              <SelectTrigger className={errors.grade_level ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kindergarten">Kindergarten</SelectItem>
                <SelectItem value="1st">1st Grade</SelectItem>
                <SelectItem value="2nd">2nd Grade</SelectItem>
                <SelectItem value="3rd">3rd Grade</SelectItem>
                <SelectItem value="4th">4th Grade</SelectItem>
                <SelectItem value="5th">5th Grade</SelectItem>
                <SelectItem value="6th">6th Grade</SelectItem>
                <SelectItem value="7th">7th Grade</SelectItem>
                <SelectItem value="8th">8th Grade</SelectItem>
                <SelectItem value="9th">9th Grade</SelectItem>
                <SelectItem value="10th">10th Grade</SelectItem>
                <SelectItem value="11th">11th Grade</SelectItem>
                <SelectItem value="12th">12th Grade</SelectItem>
              </SelectContent>
            </Select>
            {errors.grade_level && (
              <p className="text-sm text-red-600">{errors.grade_level.message}</p>
            )}
          </div>

          {/* Learning Style */}
          <div className="space-y-2">
            <Label htmlFor="learning_style">Learning Style (Optional)</Label>
            <Select onValueChange={(value) => setValue('learning_style', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select learning style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual</SelectItem>
                <SelectItem value="auditory">Auditory</SelectItem>
                <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                <SelectItem value="reading">Reading/Writing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="student@school.edu"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Special Considerations */}
          <div className="space-y-2">
            <Label htmlFor="special_considerations">Special Considerations (Optional)</Label>
            <Textarea
              id="special_considerations"
              {...register('special_considerations')}
              placeholder="Any learning accommodations, IEP notes, or special considerations..."
              className={errors.special_considerations ? 'border-red-500' : ''}
            />
            {errors.special_considerations && (
              <p className="text-sm text-red-600">{errors.special_considerations.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading || !isValid || validationErrors.length > 0}
            className="w-full"
          >
            {isLoading ? 'Saving...' : 'Save Student'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ValidatedStudentForm;
