import React, { useState } from 'react';
import { LessonBlock } from '../../../../services/lessonService';

interface TrueFalseBlockProps {
  block: LessonBlock;
  data: any;
  index: number;
}

const TrueFalseBlock: React.FC<TrueFalseBlockProps> = ({ block, data, index }) => {
  const [selections, setSelections] = useState<Record<number, boolean | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { statements, answers } = data;

  const handleSelect = (idx: number, val: boolean) => {
    if (isSubmitted) return;
    setSelections(prev => ({ ...prev, [idx]: val }));
  };

  const handleCheck = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelections({});
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
      
      <div className="exercise-instruction-row">
        <p className="exercise-instruction">{block.static.instruction}</p>
        <div className="tf-column-headers">
           <span className="tf-header">True</span>
           <span className="tf-header">False</span>
        </div>
      </div>

      <div className="true-false-list">
        {statements.map((statement: string, i: number) => {
          const selection = selections[i];
          const correctAnswer = answers[i];
          const isCorrect = selection === correctAnswer;

          return (
            <div key={i} className="true-false-item">
              <p className={`true-false-sentence ${isSubmitted && selection !== null ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
                {i + 1}. {statement}
              </p>
              <div className="true-false-options">
                <button
                  className={`option-button ${selection === true ? 'selected' : ''} ${isSubmitted && selection === true ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                  onClick={() => handleSelect(i, true)}
                  disabled={isSubmitted}
                >
                  <div className="option-circle" />
                </button>
                <button
                  className={`option-button ${selection === false ? 'selected' : ''} ${isSubmitted && selection === false ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                  onClick={() => handleSelect(i, false)}
                  disabled={isSubmitted}
                >
                  <div className="option-circle" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="exercise-actions">
        <button className="reset-button" onClick={handleReset}>
          <img src="/assets/lesson/refresh.svg" alt="Reset" />
        </button>
        <button className="check-button" onClick={handleCheck} disabled={isSubmitted && Object.keys(selections).length === 0}>
           <span>Check</span>
        </button>
      </div>
    </div>
  );
};

export default TrueFalseBlock;
