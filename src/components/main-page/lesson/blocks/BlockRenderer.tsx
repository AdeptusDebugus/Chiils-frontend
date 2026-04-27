import React from 'react';
import { LessonBlock } from '../../../../services/lessonService';
import MultipleChoiceBlock from './MultipleChoiceBlock';
import MatchingBlock from './MatchingBlock';
import TrueFalseBlock from './TrueFalseBlock';
import ExplanationBlock from './ExplanationBlock';
import CorrectionBlock from './CorrectionBlock';
import StaticBlock from './StaticBlock';

interface BlockRendererProps {
  block: LessonBlock;
  data: any;
  index: number;
  grammarTopics?: string[] | null;
  previewMode?: boolean;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, data, index, grammarTopics, previewMode = false }) => {
  if (!data) return null;

  switch (block.interaction_type) {
    case 'multiple_choice':
      return <MultipleChoiceBlock block={block} data={data} index={index} grammarTopics={grammarTopics} previewMode={previewMode} />;
    case 'matching':
      return <MatchingBlock block={block} data={data} index={index} previewMode={previewMode} />;
    case 'true_false':
      return <TrueFalseBlock block={block} data={data} index={index} previewMode={previewMode} />;
    case 'explanation':
      return <ExplanationBlock block={block} data={data} index={index} grammarTopics={grammarTopics} />;
    case 'correction':
      return <CorrectionBlock block={block} data={data} index={index} grammarTopics={grammarTopics} previewMode={previewMode} />;
    case 'static':
      return <StaticBlock block={block} data={data} index={index} />;
    default:
      return (
        <div className="exercises-section">
          <div className="exercise-header-row">
            <h2>{block.static.title}</h2>
          </div>
          <p>Unsupported interaction type: {block.interaction_type}</p>
        </div>
      );
  }
};

export default BlockRenderer;
