import React from 'react';
import { LessonBlock } from '../../../../services/lessonService';

interface StaticBlockProps {
  block: LessonBlock;
  data: any;
  index: number;
}

const StaticBlock: React.FC<StaticBlockProps> = ({ block, data, index }) => {
  const questions = data.questions || block.static.questions || [];

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

      <div className="static-questions-box">
        {questions.map((q: string, i: number) => (
          <div key={i} className="static-question-item">
            <span className="bullet-point" />
            <p>{q}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaticBlock;
