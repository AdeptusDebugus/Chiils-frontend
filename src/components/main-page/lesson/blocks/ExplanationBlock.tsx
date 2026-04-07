import React from 'react';
import { LessonBlock } from '../../../../services/lessonService';

interface ExplanationBlockProps {
  block: LessonBlock;
  data: any;
  index: number;
  grammarTopics?: string[] | null;
}

const ExplanationBlock: React.FC<ExplanationBlockProps> = ({ block, data, index, grammarTopics }) => {
  const grammarBadge = grammarTopics && grammarTopics.length > 0 ? grammarTopics[0] : null;

  return (
    <div className="exercises-section">
      <div className="exercise-header-row">
        <h2>{block.static.title}</h2>
        {block.type === 'grammar_note' && grammarBadge && (
          <div className="exercise-badge">{grammarBadge}</div>
        )}
      </div>
      <p className="exercise-instruction">{block.static.instruction}</p>

      <div className="explanation-content">
        {data.example && (
          <div className="explanation-section">
            <h3>Example</h3>
            <div className="explanation-box">{data.example}</div>
          </div>
        )}
        {data.grammar_rule && (
          <div className="explanation-section">
            <h3>Grammar rule</h3>
            <div className="explanation-box">{data.grammar_rule}</div>
          </div>
        )}
        {data.contrast_or_common_mistake && (
          <div className="explanation-section">
            <h3>Contrast or common mistake</h3>
            <div className="explanation-box">{data.contrast_or_common_mistake}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplanationBlock;
