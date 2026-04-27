import './NoResultsNotification.css';

const SEARCH_ICON_SRC = '/assets/search.svg';

interface NoResultsNotificationProps {
    className?: string;
}

const NoResultsNotification: React.FC<NoResultsNotificationProps> = ({ className }) => (
    <div className={['no-results-notification', className].filter(Boolean).join(' ')}>
        <img
            className="no-results-notification-icon"
            src={SEARCH_ICON_SRC}
            alt=""
            aria-hidden="true"
        />
        <p className="no-results-notification-text">Nothing found...</p>
    </div>
);

export default NoResultsNotification;
