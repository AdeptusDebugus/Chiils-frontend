export const LANGUAGES = ['English'] as const;
export type Language = typeof LANGUAGES[number];

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = typeof CEFR_LEVELS[number];

export const PRESETS = ['Claudia (classic, guided, balanced)'] as const;
export type Preset = typeof PRESETS[number];

export const GRAMMAR_TOPICS_BY_LEVEL: Record<CefrLevel, readonly string[]> = {
    A1: [
        'Present Simple',
        'To be',
        'There is / There are',
        'Future forms (will / going to)',
        'Past Simple',
        'Articles',
        'Pronouns',
        'Possessives',
        'Can (ability)',
        'Must (obligation)',
        'Basic questions',
        'Have got'
    ],
    A2: [
        'Past Simple',
        'Present Continuous (future)',
        'Comparatives & superlatives',
        'Quantifiers (some/any/much/many)',
        'Should (advice)',
        'Have to (obligation)',
        'Gerund / infinitive',
        'Going to (plans)',
        'Object pronouns',
        'Prepositions (time/place)',
        'Present Simple vs Continuous',
        'There was / There were',
        'Past Simple questions',
        'Question patterns'
    ],
    B1: [
        'Ability & possibility',
        'Advice & obligation',
        'Comparatives & superlatives',
        'First Conditional',
        'Future forms',
        'Gerunds & infinitives',
        'Passive voice',
        'Past Continuous',
        'Past Perfect',
        'Present Perfect vs Past Simple',
        'Relative clauses',
        'Reported Speech',
        'Past Simple vs Past Continuous',
        'Present Perfect',
        'Second Conditional',
        'Quantifiers'
    ],
    B2: [
        'Third Conditional',
        'Mixed Conditionals',
        'Future Perfect',
        'Future Continuous',
        'Modal verbs (past forms)',
        'Non-defining clauses',
        'Wish / If only',
        'Gerund / infinitive (advanced)',
        'Reported Speech (advanced)',
        'Passive (advanced)',
        'Inversion (negatives)',
        'Causatives (have/get done)',
        'Narrative tenses (advanced)',
        'Contrast & concession clauses',
        'Cleft sentences',
        'Advanced quantifiers'
    ],
    C1: [
        'Advanced inversion',
        'Conditional inversion',
        'Mixed conditionals (advanced)',
        'Narrative tenses (complex)',
        'Complex passive',
        'Cleft structures',
        'Emphatic structures',
        'Future Perfect Continuous',
        'Modal perfect forms',
        'Advanced linking',
        'Nominalisation',
        'Participial clauses',
        'Reduced clauses',
        'Wish / If only (nuanced)',
        'Idiomatic inversion',
        'Register & style'
    ],
    C2: [
        'Advanced inversion patterns',
        'Inversion in conditionals (C2)',
        'Mixed conditionals (complex)',
        'Narrative tenses (extended)',
        'Complex passives (C2)',
        'Cleft & pseudo-cleft structures',
        'Emphatic & contrastive structures',
        'Future Perfect Continuous (advanced use)',
        'Modal perfect (complex forms)',
        'Advanced linking & cohesion',
        'Nominalisation (C2)',
        'Participial reductions',
        'Reduced relative clauses (advanced)',
        'Wish / If only (C2 nuances)',
        'Idiomatic inversion (C2)',
        'Register, tone & stylistic control'
    ]
} as const;

export type GrammarTopic = typeof GRAMMAR_TOPICS_BY_LEVEL[CefrLevel][number];

export const TOPICS = [
    'Architecture & Interior',
    'Art & Culture',
    'Design & Creative',
    'Everyday Life',
    'Fashion & Beauty',
    'Food & Cooking',
    'Health & Fitness',
    'Marketing & Media',
    'Nature & Environment',
    'Relationships',
    'Science & Education',
    'Society & Politics',
    'Tech & Startups',
    'Travel'
] as const;
export type Topic = typeof TOPICS[number];
