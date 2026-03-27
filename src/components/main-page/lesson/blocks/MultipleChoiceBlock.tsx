import React, { useState } from 'react';
import { LessonBlock } from '../../../../services/lessonService';

interface MultipleChoiceBlockProps {
  block: LessonBlock;
  data: any;
  index: number;
}

const MultipleChoiceBlock: React.FC<MultipleChoiceBlockProps> = ({ block, data, index }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isMultiItem = Array.isArray(data.items);
  const items = isMultiItem ? data.items : [{ options: data.options, correct_answer: data.correct_answer }];

  const handleSelect = (itemIdx: number, option: string) => {
    if (isSubmitted) return;
    setSelectedOptions(prev => ({ ...prev, [itemIdx]: option }));
  };

  const handleCheck = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedOptions({});
    setIsSubmitted(false);
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

      <div className="exercise-questions">
        {items.map((item: any, i: number) => {
          const selected = selectedOptions[i];
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
                  if (isSubmitted && isOptSelected) {
                    if (isOptCorrect) className += " correct";
                    else className += " incorrect";
                  }

                  return (
                    <button
                      key={optIdx}
                      className={className}
                      onClick={() => handleSelect(i, option)}
                      disabled={isSubmitted}
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
        <button className="reset-button" onClick={handleReset}>
          <img src="/assets/lesson/refresh.svg" alt="Reset" />
        </button>
        <button className="check-button" onClick={handleCheck} disabled={isSubmitted && Object.keys(selectedOptions).length === 0}>
           <span>Check</span>
        </button>
      </div>
      
    </div>
  );
};

export default MultipleChoiceBlock;
