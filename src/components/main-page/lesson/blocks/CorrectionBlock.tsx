import React, { useState } from 'react';
import { LessonBlock } from '../../../../services/lessonService';

interface CorrectionBlockProps {
  block: LessonBlock;
  data: any;
  index: number;
  grammarTopics?: string[] | null;
  previewMode?: boolean;
}

const CorrectionBlock: React.FC<CorrectionBlockProps> = ({ block, data, index, grammarTopics, previewMode = false }) => {
  const grammarBadge = grammarTopics && grammarTopics.length > 0 ? grammarTopics[0] : null;

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const items = data.items || [];

  const handleInputChange = (idx: number, val: string) => {
    if (previewMode) return;
    setUserAnswers(prev => ({ ...prev, [idx]: val }));
  };

  const toggleAnswer = (idx: number) => {
    if (previewMode) return;
    setShowAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="exercises-section">
      <div className="exercise-header-row">
        <h2>{block.static.title}</h2>
        {block.type === 'warm_up' && <div className="exercise-badge">Before watching</div>}
        {block.type === 'big_picture' && <div className="exercise-badge">Listen once</div>}
        {block.type === 'vocabulary_unlock' && <div className="exercise-badge">Before watching</div>}
        {block.type === 'fact_check' && <div className="exercise-badge">Listen again</div>}
        {block.type === 'fix_it' && grammarBadge && <div className="exercise-badge">{grammarBadge}</div>}
      </div>
      <p className="exercise-instruction">{block.static.instruction}</p>

      <div className="correction-list">
        {items.map((item: any, i: number) => {
          const isAnswerVisible = showAnswers[i];
          const userAnswer = userAnswers[i] || "";

          return (
            <div key={i} className="correction-item-wrapper">
              <div className="correction-item">
                <div className="correction-input-container">
                  <span className="item-number">{i + 1}.</span>
                  <input
                    type="text"
                    defaultValue={item.incorrect}
                    onChange={(e) => handleInputChange(i, e.target.value)}
                    className="correction-input"
                    disabled={previewMode}
                  />
                </div>
                <button 
                  className="toggle-answer-btn" 
                  onClick={() => toggleAnswer(i)}
                  disabled={previewMode}
                >
                  {isAnswerVisible ? (
                    <>
                      Hide answer
                      <img src="/assets/lesson/expand_up.svg" alt="Up" />
                    </>
                  ) : (
                    <>
                      Show answer
                      <img src="/assets/lesson/expand_down.svg" alt="Down" />
                    </>
                  )}
                </button>
              </div>
              {isAnswerVisible && (
                <div className="revealed-answer-row">
                  <div className="revealed-answer">
                    <span className="item-number">{i + 1}.</span>
                    <p className="revealed-answer-text">{item.correct}</p>
                  </div>
                  <div className="toggle-answer-btn-placeholder" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CorrectionBlock;
