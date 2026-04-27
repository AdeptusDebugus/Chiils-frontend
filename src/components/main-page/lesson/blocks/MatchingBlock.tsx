import React, { useState, useEffect } from 'react';
import { LessonBlock } from '../../../../services/lessonService';

interface MatchingBlockProps {
  block: LessonBlock;
  data: any;
  index: number;
  previewMode?: boolean;
}

const MatchingBlock: React.FC<MatchingBlockProps> = ({ block, data, index, previewMode = false }) => {
  const { terms, meanings, answer_pairs } = data;
  
  // Initialize orderedMeanings with shuffled meanings on mount
  const [orderedMeanings, setOrderedMeanings] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    // Shuffle meanings
    const shuffled = [...meanings].sort(() => Math.random() - 0.5);
    setOrderedMeanings(shuffled);
  }, [meanings]);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (previewMode || isSubmitted) return;
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (previewMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (previewMode || isSubmitted) return;
    setDragOverIndex(idx);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (previewMode || isSubmitted || draggedIndex === null || draggedIndex === targetIdx) return;

    const newOrder = [...orderedMeanings];
    const draggedItem = newOrder[draggedIndex];
    const targetItem = newOrder[targetIdx];
    
    newOrder[targetIdx] = draggedItem;
    newOrder[draggedIndex] = targetItem;
    
    setOrderedMeanings(newOrder);
    setDraggedIndex(null);
  };

  const handleCheck = () => {
    if (previewMode) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    if (previewMode) return;
    setIsSubmitted(false);
    const shuffled = [...meanings].sort(() => Math.random() - 0.5);
    setOrderedMeanings(shuffled);
  };

  return (
    <div className="exercises-section">
      <div className="exercise-header-row">
        <h2>{block.static.title}</h2>
        {block.type === 'warm_up' && <div className="exercise-badge">Before watching</div>}
        {block.type === 'big_picture' && <div className="exercise-badge">Listen once</div>}
        {block.type === 'vocabulary_unlock' && <div className="exercise-badge">Before watching</div>}
        {block.type === 'fact_check' && <div className="exercise-badge">Listen again</div>}
      </div>
      <p className="exercise-instruction">{block.static.instruction}</p>

      <div className="matching-container">
        <div className="matching-column terms-column">
          {terms.map((term: string, i: number) => {
            const currentMeaning = orderedMeanings[i];
            const pair = answer_pairs.find((p: string[]) => p[0] === term);
            const isCorrect = isSubmitted && currentMeaning === pair?.[1];

            let className = "matching-item term-item static-item";
            if (isSubmitted) {
              className += isCorrect ? " correct" : " incorrect";
            }

            return (
              <div key={i} className={className}>
                {term}
              </div>
            );
          })}
        </div>

        <div className="matching-column meanings-column">
          {orderedMeanings.map((meaning: string, i: number) => {
            const pair = answer_pairs.find((p: string[]) => p[0] === terms[i]);
            const isCorrect = isSubmitted && meaning === pair?.[1];
            
            let className = "matching-item meaning-item draggable-item";
            if (isSubmitted) {
              className += isCorrect ? " correct" : " incorrect";
            }
            if (draggedIndex === i) className += " dragging";
            if (dragOverIndex === i && draggedIndex !== i) className += " drag-over";

            return (
              <div
                key={i}
                className={className}
                draggable={!previewMode && !isSubmitted}
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, i)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, i)}
              >
                {meaning}
              </div>
            );
          })}
        </div>
      </div>

      <div className="exercise-actions">
        <button className="reset-button" onClick={handleReset} disabled={previewMode}>
          <img src="/assets/lesson/refresh.svg" alt="Reset" />
        </button>
        <button className="check-button" onClick={handleCheck} disabled={previewMode || isSubmitted}>
           <span>Check</span>
        </button>
      </div>
    </div>
  );
};

export default MatchingBlock;
