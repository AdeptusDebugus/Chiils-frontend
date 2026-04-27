import React, { useState } from 'react';
import { LessonBlock } from '../../../../services/lessonService';

interface MultipleChoiceBlockProps {
  block: LessonBlock;
  data: any;
  index: number;
  grammarTopics?: string[] | null;
  previewMode?: boolean;
}

const MultipleChoiceBlock: React.FC<MultipleChoiceBlockProps> = ({ block, data, index, grammarTopics, previewMode = false }) => {
  const grammarBadge = grammarTopics && grammarTopics.length > 0 ? grammarTopics[0] : null;

  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [submittedItems, setSubmittedItems] = useState<Record<number, boolean>>({});

  const isMultiItem = Array.isArray(data.items);
  const items = isMultiItem ? data.items : [{ options: data.options, correct_answer: data.correct_answer }];

  const handleSelect = (itemIdx: number, option: string) => {
    if (previewMode) return;
    // If this item is already correctly answered and submitted, don't allow change
    if (submittedItems[itemIdx] && selectedOptions[itemIdx] === items[itemIdx].correct_answer) return;
    
    setSelectedOptions(prev => ({ ...prev, [itemIdx]: option }));
    
    // If the item was previously submitted, reset its submitted state to clear feedback
    if (submittedItems[itemIdx]) {
      setSubmittedItems(prev => ({ ...prev, [itemIdx]: false }));
    }
  };

  const handleCheck = () => {
    if (previewMode) return;
    const newSubmitted: Record<number, boolean> = {};
    items.forEach((_: any, i: number) => {
      newSubmitted[i] = true;
    });
    setSubmittedItems(newSubmitted);
  };

  const handleReset = () => {
    if (previewMode) return;
    setSelectedOptions({});
    setSubmittedItems({});
  };

  return (
    <div className="exercises-section">
      <div className="exercise-header-row">
        <h2>{block.static.title}</h2>
        {block.type === 'warm_up' && <div className="exercise-badge">Before watching</div>}
        {block.type === 'big_picture' && <div className="exercise-badge">Listen once</div>}
        {block.type === 'vocabulary_unlock' && <div className="exercise-badge">Before watching</div>}
        {block.type === 'fact_check' && <div className="exercise-badge">Listen again</div>}
        {block.type === 'make_the_right_choice' && grammarBadge && <div className="exercise-badge">{grammarBadge}</div>}
      </div>
      <p className="exercise-instruction">{block.static.instruction}</p>

      <div className="exercise-questions">
        {items.map((item: any, i: number) => {
          const selected = selectedOptions[i];
          const isItemSubmitted = submittedItems[i];
          const isCorrect = selected === item.correct_answer;
          const isRowLayout = block.static.title?.includes('5B');
          
          return (
            <div key={i} className={`multiple-choice-item ${isRowLayout ? 'row-layout' : ''}`}>
              {item.sentence && (
                <p className="multiple-choice-sentence">
                  {i + 1}. {item.sentence}
                </p>
              )}
              <div className="multiple-choice-options">
                  {item.options.map((option: string, optIdx: number) => {
                    const isOptSelected = selected === option;
                    const isOptCorrect = option === item.correct_answer;
                    
                    let className = "option-button";
                    if (isOptSelected) className += " selected";
                    if (isItemSubmitted && isOptSelected) {
                      if (isOptCorrect) className += " correct";
                      else className += " incorrect";
                    }

                    return (
                      <button
                        key={optIdx}
                        className={className}
                        onClick={() => handleSelect(i, option)}
                        disabled={previewMode || (isItemSubmitted && isOptSelected && isOptCorrect)}
                      >
                      <span className="option-circle" />
                      <span className="option-text">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="exercise-actions">
        <button className="reset-button" onClick={handleReset} disabled={previewMode}>
          <img src="/assets/lesson/refresh.svg" alt="Reset" />
        </button>
        <button 
          className="check-button" 
          onClick={handleCheck} 
          disabled={previewMode || Object.keys(selectedOptions).length === 0}
        >
           <span>Check</span>
        </button>
      </div>
      
    </div>
  );
};

export default MultipleChoiceBlock;
