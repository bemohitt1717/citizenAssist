import { lazy, Suspense, useEffect, useState } from 'react';
import { TextAnimate } from '@/registry/magicui/text-animate';
import Logo from '../../common/Logo/Logo';
import './LoadingStates.css';

const LottieLoader = lazy(() => import('./LottieLoader.jsx'));

const OpeningProgress = ({ mode }) => (
  <div className={`ca-opening__progress ca-opening__progress--${mode}`} aria-hidden="true">
    <span className="ca-opening__progress-track">
      {mode === 'intro' ? (
        <span className="ca-opening__progress-fill" />
      ) : (
        <Suspense fallback={<span className="ca-opening__progress-loop" />}>
          <LottieLoader speed={1.74} />
        </Suspense>
      )}
    </span>
  </div>
);

const Skeleton = ({ className = '' }) => (
  <span className={`ca-skeleton ${className}`.trim()} aria-hidden="true" />
);

const SkeletonRows = ({ count = 4, roomy = false }) => (
  <div className={`ca-loading-rows ${roomy ? 'ca-loading-rows--roomy' : ''}`.trim()} aria-hidden="true">
    {Array.from({ length: count }, (_, index) => (
      <div className="ca-loading-row" key={index}>
        <Skeleton className="ca-loading-row__icon" />
        <span className="ca-loading-row__copy">
          <Skeleton className="ca-loading-row__title" />
          <Skeleton className="ca-loading-row__meta" />
        </span>
        <Skeleton className="ca-loading-row__action" />
      </div>
    ))}
  </div>
);

const SkeletonStats = ({ count = 4 }) => (
  <div className="ca-loading-stats" aria-hidden="true">
    {Array.from({ length: count }, (_, index) => (
      <div className="ca-loading-stat" key={index}>
        <Skeleton className="ca-loading-stat__label" />
        <Skeleton className="ca-loading-stat__value" />
        <Skeleton className="ca-loading-stat__note" />
      </div>
    ))}
  </div>
);

const SkeletonPanel = ({ rows = 3, className = '' }) => (
  <div className={`ca-loading-panel ${className}`.trim()} aria-hidden="true">
    <Skeleton className="ca-loading-panel__heading" />
    <SkeletonRows count={rows} />
  </div>
);

export const SectionLoading = ({ variant = 'dashboard' }) => {
  if (variant === 'profile') {
    return (
      <div className="ca-loading-state" role="status" aria-label="Loading content" aria-busy="true">
        <div className="ca-loading-columns" aria-hidden="true">
          {[0, 1].map((column) => (
            <div className="ca-loading-panel ca-loading-form" key={column}>
              <Skeleton className="ca-loading-panel__heading" />
              {[0, 1, 2, 3].map((field) => (
                <span className="ca-loading-field" key={field}>
                  <Skeleton className="ca-loading-field__label" />
                  <Skeleton className="ca-loading-field__input" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'services') {
    return (
      <div className="ca-loading-state" role="status" aria-label="Loading content" aria-busy="true">
        <div className="ca-loading-service-list" aria-hidden="true">
          {[0, 1, 2].map((card) => (
            <div className="ca-loading-panel" key={card}>
              <Skeleton className="ca-loading-panel__heading" />
              <Skeleton className="ca-loading-field__input" />
              <Skeleton className="ca-loading-field__input" />
              <Skeleton className="ca-loading-service-list__copy" />
              <Skeleton className="ca-loading-service-list__button" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'service-detail') {
    return (
      <div className="ca-loading-state" role="status" aria-label="Loading content" aria-busy="true">
        <div className="ca-loading-detail" aria-hidden="true">
          <div className="ca-loading-panel ca-loading-detail__main">
            <Skeleton className="ca-loading-panel__heading" />
            <Skeleton className="ca-loading-detail__title" />
            <Skeleton className="ca-loading-detail__copy" />
            <SkeletonRows count={5} />
          </div>
          <div className="ca-loading-panel ca-loading-detail__side">
            <Skeleton className="ca-loading-panel__heading" />
            <Skeleton className="ca-loading-detail__art" />
            <SkeletonRows count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="ca-loading-state" role="status" aria-label="Loading content" aria-busy="true">
        <div className="ca-loading-tabs" aria-hidden="true">
          {[0, 1, 2, 3].map((tab) => <Skeleton className="ca-loading-tabs__item" key={tab} />)}
        </div>
        <SkeletonPanel rows={5} />
      </div>
    );
  }

  if (variant === 'track') {
    return (
      <div className="ca-loading-state" role="status" aria-label="Loading content" aria-busy="true">
        <div className="ca-loading-track" aria-hidden="true">
          <div className="ca-loading-track__list">
            {[0, 1, 2].map((item) => (
              <div className="ca-loading-panel" key={item}>
                <Skeleton className="ca-loading-panel__heading" />
                <Skeleton className="ca-loading-track__status" />
                <Skeleton className="ca-loading-track__line" />
                <Skeleton className="ca-loading-track__line ca-loading-track__line--short" />
              </div>
            ))}
          </div>
          <SkeletonPanel rows={5} className="ca-loading-track__detail" />
        </div>
      </div>
    );
  }

  if (variant === 'earnings') {
    return (
      <div className="ca-loading-state" role="status" aria-label="Loading content" aria-busy="true">
        <SkeletonStats count={3} />
        <SkeletonPanel rows={4} />
      </div>
    );
  }

  return (
    <div className="ca-loading-state" role="status" aria-label="Loading content" aria-busy="true">
      <SkeletonStats />
      <div className="ca-loading-panels">
        <SkeletonPanel rows={4} />
        <SkeletonPanel rows={3} />
      </div>
    </div>
  );
};

export const ServiceCardsLoading = ({ count = 6 }) => (
  <div className="ca-grid ca-service-loading" role="status" aria-label="Loading services" aria-busy="true">
    {Array.from({ length: count }, (_, index) => (
      <div className="ca-service-skeleton" key={index} aria-hidden="true">
        <span className="ca-service-skeleton__top">
          <Skeleton className="ca-service-skeleton__icon" />
          <Skeleton className="ca-service-skeleton__time" />
        </span>
        <Skeleton className="ca-service-skeleton__title" />
        <span className="ca-service-skeleton__body">
          <Skeleton />
          <Skeleton />
          <Skeleton className="ca-service-skeleton__body-short" />
        </span>
        <span className="ca-service-skeleton__meta">
          <Skeleton className="ca-service-skeleton__meta-item" />
          <Skeleton className="ca-service-skeleton__meta-item" />
        </span>
        <Skeleton className="ca-service-skeleton__button" />
      </div>
    ))}
  </div>
);

export const StatsLoading = ({ count = 3 }) => (
  <div className="ca-loading-state" role="status" aria-label="Loading summary" aria-busy="true">
    <SkeletonStats count={count} />
  </div>
);

export const RouteLoading = () => (
  <div className="ca-route-loading" role="status" aria-label="Loading page">
    <span className="ca-inline-loader" aria-hidden="true" />
  </div>
);

export const BrandedOpening = ({ onComplete }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const fadeTimeout = window.setTimeout(() => setIsLeaving(true), 5100);
    const completeTimeout = window.setTimeout(() => onComplete?.(), 5750);

    return () => {
      window.clearTimeout(fadeTimeout);
      window.clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className={`ca-opening ${isLeaving ? 'ca-opening--leaving' : ''}`.trim()} role="status" aria-label="Citizen Assist is opening">
      <span className="ca-opening__brand" aria-hidden="true"><Logo showWordmark={false} size={30} /></span>

      <div className="ca-opening__content">
        <h1 className="ca-opening__headline" aria-label="Citizen Assist">
          <TextAnimate animation="blurInUp" by="character" duration={5}>
            Citizen Assist
          </TextAnimate>
        </h1>
        <OpeningProgress mode="intro" />
      </div>
    </div>
  );
};

export const HomeRefreshOpening = ({ isLeaving = false }) => (
  <div className={`ca-opening ca-opening--refresh ${isLeaving ? 'ca-opening--refresh-leaving' : ''}`.trim()} role="status" aria-label="Citizen Assist is loading">
    <div className="ca-opening__content">
      <h1 className="ca-opening__headline ca-opening__headline--static">Citizen Assist</h1>
      <OpeningProgress mode="refresh" />
    </div>
  </div>
);
