
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  AlertCircle, 
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';

interface InteractiveInsightCardProps {
  title: string;
  items: string[];
  type: 'strength' | 'growth' | 'recommendation';
  className?: string;
  onMarkAsAddressed?: (item: string) => void;
  onCreateGoal?: (item: string) => void;
}

const InteractiveInsightCard: React.FC<InteractiveInsightCardProps> = ({
  title,
  items,
  type,
  className = '',
  onMarkAsAddressed,
  onCreateGoal
}) => {
  const [addressedItems, setAddressedItems] = useState<Set<string>>(new Set());
  const [showMore, setShowMore] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'strength':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'growth':
        return <Target className="h-5 w-5 text-orange-600" />;
      case 'recommendation':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const getTypeColor = (): string => {
    switch (type) {
      case 'strength':
        return 'text-green-700 border-green-200 bg-green-50';
      case 'growth':
        return 'text-orange-700 border-orange-200 bg-orange-50';
      case 'recommendation':
        return 'text-blue-700 border-blue-200 bg-blue-50';
      default:
        return 'text-gray-700 border-gray-200 bg-gray-50';
    }
  };

  const handleMarkAsAddressed = (item: string): void => {
    const newAddressed = new Set(addressedItems);
    if (newAddressed.has(item)) {
      newAddressed.delete(item);
    } else {
      newAddressed.add(item);
    }
    setAddressedItems(newAddressed);
    onMarkAsAddressed?.(item);
  };

  const handleShowMore = (): void => {
    setShowMore(!showMore);
  };

  if (items.length === 0) return null;

  const visibleItems = showMore ? items : items.slice(0, 5);

  return (
    <Card className={`${className} ${getTypeColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {getIcon()}
          {title}
          <Badge variant="outline" className="ml-auto">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleItems.map((item, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border transition-all duration-200 ${
                addressedItems.has(item) 
                  ? 'bg-gray-100 opacity-60 line-through' 
                  : 'bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm flex-1">{item}</p>
                <div className="flex gap-1">
                  {type === 'recommendation' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsAddressed(item)}
                        className="h-6 w-6 p-0"
                        title="Mark as addressed"
                      >
                        <CheckCircle2 className={`h-3 w-3 ${
                          addressedItems.has(item) ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCreateGoal?.(item)}
                        className="h-6 w-6 p-0"
                        title="Create goal from this recommendation"
                      >
                        <Target className="h-3 w-3 text-blue-500" />
                      </Button>
                    </>
                  )}
                  {type === 'growth' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCreateGoal?.(item)}
                      className="h-6 w-6 p-0"
                      title="Create goal for this growth area"
                    >
                      <BookOpen className="h-3 w-3 text-orange-500" />
                    </Button>
                  )}
                  {type === 'strength' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCreateGoal?.(item)}
                      className="h-6 w-6 p-0"
                      title="Create goal to build on this strength"
                    >
                      <Target className="h-3 w-3 text-green-500" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {items.length > 5 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={handleShowMore}
            >
              {showMore ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show {items.length - 5} More
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveInsightCard;
