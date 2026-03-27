import React, { useState, useEffect } from 'react';
import { LessonBlock } from '../../../../services/lessonService';

interface MatchingBlockProps {
  block: LessonBlock;
  data: any;
  index: number;
}

const MatchingBlock: React.FC<MatchingBlockProps> = ({ block, data, index }) => {
  const { terms, meanings, answer_pairs } = data;
  
  // Initialize orderedMeanings with shuffled meanings on mount
  const [orderedMeanings, setOrderedMeanings] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Shuffle meanings
    const shuffled = [...meanings].sort(() => Math.random() - 0.5);
    setOrderedMeanings(shuffled);
  }, [meanings]);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (isSubmitted) return;
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (isSubmitted || draggedIndex === null || draggedIndex === targetIdx) return;

    const newOrder = [...orderedMeanings];
    const draggedItem = newOrder[draggedIndex];
    
    // Remove from old position and insert at new position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIdx, 0, draggedItem);
    
    setOrderedMeanings(newOrder);
    setDraggedIndex(null);
  };

  const handleCheck = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
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

            return (
              <div
                key={i}
                className={className}
                draggable={!isSubmitted}
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, i)}
              >
                {meaning}
              </div>
            );
          })}
        </div>
      </div>

      <div className="exercise-actions">
        <button className="reset-button" onClick={handleReset}>
          <img src="/assets/lesson/refresh.svg" alt="Reset" />
        </button>
        <button className="check-button" onClick={handleCheck} disabled={isSubmitted}>
           <span>Check</span>
        </button>
      </div>
    </div>
  );
};

export default MatchingBlock;
