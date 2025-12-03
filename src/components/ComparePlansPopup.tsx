import React from 'react';
import './ComparePlansPopup.css';

interface ComparePlansPopupProps {
    onClose: () => void;
}

const DESCRIPTIONS: Record<string, string> = {
    "Community lessons": "Lessons made by other Chiils users",
    "Flashcards & Quizlet import": "Online flashcards & quick export to Quizlet",
    "Grammar hints": "Instant grammar help inside every exercise",
    "Lesson builder": "Create your own lessons in a couple of clicks",
    "Minutes included": "1 minute of video = 1 minute used",
    "Extra 100 minutes": "Add more minutes anytime",
    "Collections": "Custom folders, favourites, personal vocab bank for reviews",
    "Generation modes": "Choose your lesson scenario",
    "Student progress": "Lesson history, status, personal vocab banks per student"
};
const checkMark = "/assets/home/pop-up/check-mark.svg"

const ComparePlansPopup: React.FC<ComparePlansPopupProps> = ({ onClose }) => {
    const [activeInfoRow, setActiveInfoRow] = React.useState<string | null>(null);
    const [hoveredCol, setHoveredCol] = React.useState<number | null>(null);

    const handleInfoClick = (rowName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveInfoRow(activeInfoRow === rowName ? null : rowName);
    };

    const handleMouseEnter = (colIndex: number) => {
        setHoveredCol(colIndex);
    };

    const handleMouseLeave = () => {
        setHoveredCol(null);
    };

    return (
        <div className="compare-popup-overlay" onClick={onClose}>
            <div className="compare-popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="compare-popup-header">
                    {/* Close button can be added here or just click outside */}
                </div>

                <div className="compare-table-container">
                    {/* Column Highlight Overlay */}
                    <div className="column-highlight-overlay">
                        <div className="overlay-col"></div> {/* Feature Name Col */}
                        <div className={`overlay-col ${hoveredCol === 0 ? 'col-highlighted' : ''}`}></div>
                        <div className={`overlay-col ${hoveredCol === 1 ? 'col-highlighted' : ''}`}></div>
                        <div className={`overlay-col ${hoveredCol === 2 ? 'col-highlighted' : ''}`}></div>
                        <div className={`overlay-col ${hoveredCol === 3 ? 'col-highlighted' : ''}`}></div>
                        <div className={`overlay-col ${hoveredCol === 4 ? 'col-highlighted' : ''}`}></div>
                    </div>

                    {/* Header Row */}
                    <div className="compare-row header-row">
                        <div className="compare-cell feature-name-header"></div>
                        <div
                            className="compare-cell plan-header"
                            onMouseEnter={() => handleMouseEnter(0)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="plan-name">Free</div>
                            <div className="plan-price">0€ / month</div>
                        </div>
                        <div
                            className="compare-cell plan-header"
                            onMouseEnter={() => handleMouseEnter(1)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="plan-name">Open Library</div>
                            <div className="plan-price">5€ / month</div>
                        </div>
                        <div
                            className="compare-cell plan-header"
                            onMouseEnter={() => handleMouseEnter(2)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="plan-name">Start</div>
                            <div className="plan-price">10€ / month</div>
                        </div>
                        <div
                            className="compare-cell plan-header recommended-plan"
                            onMouseEnter={() => handleMouseEnter(3)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="plan-name">Plus</div>
                            <div className="plan-price">20€ / month</div>
                        </div>
                        <div
                            className="compare-cell plan-header"
                            onMouseEnter={() => handleMouseEnter(4)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="plan-name">Pro</div>
                            <div className="plan-price">30€ / month</div>
                        </div>
                    </div>

                    {/* Row: Community lessons */}
                    <div className="compare-row">
                        <div className="compare-cell feature-name">
                            <div>
                                Community lessons
                                {activeInfoRow === "Community lessons" && (
                                    <div className="feature-description">{DESCRIPTIONS["Community lessons"]}</div>
                                )}
                            </div>
                            <span
                                className="info-icon"
                                onClick={(e) => handleInfoClick("Community lessons", e)}
                            >
                                ?
                            </span>
                        </div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(0)} onMouseLeave={handleMouseLeave}>Preview</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(1)} onMouseLeave={handleMouseLeave}>Full<br />interactive</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(2)} onMouseLeave={handleMouseLeave}>Full<br />interactive</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(3)} onMouseLeave={handleMouseLeave}>Full<br />interactive</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}>Full<br />interactive</div>
                    </div>

                    {/* Row: Flashcards & Quizlet import */}
                    <div className="compare-row">
                        <div className="compare-cell feature-name">
                            <div>
                                Flashcards <br />& Quizlet import
                                {activeInfoRow === "Flashcards & Quizlet import" && (
                                    <div className="feature-description">{DESCRIPTIONS["Flashcards & Quizlet import"]}</div>
                                )}
                            </div>
                            <span
                                className="info-icon"
                                onClick={(e) => handleInfoClick("Flashcards & Quizlet import", e)}
                            >
                                ?
                            </span>
                        </div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(0)} onMouseLeave={handleMouseLeave}>Preview</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(1)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(2)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(3)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                    </div>

                    {/* Row: Grammar hints */}
                    <div className="compare-row">
                        <div className="compare-cell feature-name">
                            <div>
                                Grammar hints
                                {activeInfoRow === "Grammar hints" && (
                                    <div className="feature-description">{DESCRIPTIONS["Grammar hints"]}</div>
                                )}
                            </div>
                            <span
                                className="info-icon"
                                onClick={(e) => handleInfoClick("Grammar hints", e)}
                            >
                                ?
                            </span>
                        </div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(0)} onMouseLeave={handleMouseLeave}>No</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(1)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(2)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(3)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                    </div>

                    {/* Row: Lesson Builder */}
                    <div className="compare-row">
                        <div className="compare-cell feature-name">
                            <div>
                                Lesson Builder
                                {activeInfoRow === "Lesson Builder" && (
                                    <div className="feature-description">{DESCRIPTIONS["Lesson builder"]}</div>
                                )}
                            </div>
                            <span
                                className="info-icon"
                                onClick={(e) => handleInfoClick("Lesson Builder", e)}
                            >
                                ?
                            </span>
                        </div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(0)} onMouseLeave={handleMouseLeave}>No</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(1)} onMouseLeave={handleMouseLeave}>No</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(2)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(3)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                    </div>

                    {/* Row: Minutes included */}
                    <div className="compare-row">
                        <div className="compare-cell feature-name">
                            <div>
                                Minutes included
                                {activeInfoRow === "Minutes included" && (
                                    <div className="feature-description">{DESCRIPTIONS["Minutes included"]}</div>
                                )}
                            </div>
                            <span
                                className="info-icon"
                                onClick={(e) => handleInfoClick("Minutes included", e)}
                            >
                                ?
                            </span>
                        </div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(0)} onMouseLeave={handleMouseLeave}>—</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(1)} onMouseLeave={handleMouseLeave}>—</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(2)} onMouseLeave={handleMouseLeave}>300 min</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(3)} onMouseLeave={handleMouseLeave}>600 min</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}>800 min</div>
                    </div>

                    {/* Row: Extra 100 minutes */}
                    <div className="compare-row">
                        <div className="compare-cell feature-name">
                            <div>
                                Extra 100 minutes
                                {activeInfoRow === "Extra 100 minutes" && (
                                    <div className="feature-description">{DESCRIPTIONS["Extra 100 minutes"]}</div>
                                )}
                            </div>
                            <span
                                className="info-icon"
                                onClick={(e) => handleInfoClick("Extra 100 minutes", e)}
                            >
                                ?
                            </span>
                        </div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(0)} onMouseLeave={handleMouseLeave}>—</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(1)} onMouseLeave={handleMouseLeave}>—</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(2)} onMouseLeave={handleMouseLeave}>5€</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(3)} onMouseLeave={handleMouseLeave}>3€
                            <span className="compare-cell font-color-orange"> (–40 %)</span>
                        </div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}>2€
                            <span className="compare-cell font-color-orange"> (–60 %)</span>
                        </div>
                    </div>

                    {/* Row: Collections (Smart Library) */}
                    <div className="compare-row">
                        <div className="compare-cell feature-name">
                            <div>
                                Collections
                                {activeInfoRow === "Collections" && (
                                    <div className="feature-description">{DESCRIPTIONS["Collections"]}</div>
                                )}
                            </div>
                            <span
                                className="info-icon"
                                onClick={(e) => handleInfoClick("Collections", e)}
                            >
                                ?
                            </span>
                        </div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(0)} onMouseLeave={handleMouseLeave}>—</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(1)} onMouseLeave={handleMouseLeave}>—</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(2)} onMouseLeave={handleMouseLeave}>No</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(3)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                    </div>

                    {/* Row: Generation modes */}
                    <div className="compare-row">
                        <div className="compare-cell feature-name">
                            <div>
                                Generation modes
                                {activeInfoRow === "Generation modes" && (
                                    <div className="feature-description">{DESCRIPTIONS["Generation modes"]}</div>
                                )}
                            </div>
                            <span
                                className="info-icon"
                                onClick={(e) => handleInfoClick("Generation modes", e)}
                            >
                                ?
                            </span>
                        </div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(0)} onMouseLeave={handleMouseLeave}>—</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(1)} onMouseLeave={handleMouseLeave}>—</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(2)} onMouseLeave={handleMouseLeave}>Homework<br />only</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(3)} onMouseLeave={handleMouseLeave}>Homework<br />& Live</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}>Homework<br />& Live</div>
                    </div>

                    {/* Row: Student progress */}
                    <div className="compare-row">
                        <div className="compare-cell feature-name">
                            <div>
                                Student progress
                                {activeInfoRow === "Student progress" && (
                                    <div className="feature-description">{DESCRIPTIONS["Student progress"]}</div>
                                )}
                            </div>
                            <span
                                className="info-icon"
                                onClick={(e) => handleInfoClick("Student progress", e)}
                            >
                                ?
                            </span>
                        </div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(0)} onMouseLeave={handleMouseLeave}>—</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(1)} onMouseLeave={handleMouseLeave}>—</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(2)} onMouseLeave={handleMouseLeave}>No</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(3)} onMouseLeave={handleMouseLeave}>No</div>
                        <div className="compare-cell font-color-grey" onMouseEnter={() => handleMouseEnter(4)} onMouseLeave={handleMouseLeave}><img src={checkMark} className="check-icon" alt={'✔'}></img></div>
                    </div>

                </div>

                <div className="compare-popup-footer">
                    <button className="got-it-btn" onClick={onClose}>Got it!</button>
                </div>

                {/* Recommended Highlight Border - handled via CSS on the column/cell */}
            </div>
        </div>
    );
};

export default ComparePlansPopup;
