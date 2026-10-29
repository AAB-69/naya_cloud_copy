import React, { useState, useEffect, useRef } from 'react';
import artBusiness from '../assets/art_business.png';
import artEfficiency from '../assets/art_efficiency.png';
import artJourney from '../assets/art_journey.png';
import artAnywhere from '../assets/art_anywhere.png';

const slides = [
  {
    id: 1,
    image: artBusiness,
    line1: 'Unlock Limitless',
    line2: 'Business Potential',
  },
  {
    id: 2,
    image: artEfficiency,
    line1: 'Efficiency at Your',
    line2: 'Fingertips',
  },
  {
    id: 3,
    image: artJourney,
    line1: 'Power Your Cloud',
    line2: 'Journey',
  },
  {
    id: 4,
    image: artAnywhere,
    line1: 'Work From',
    line2: 'Anywhere, Anytime',
  },
];

export default function ServerCard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="server-card-outer"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="server-card-inner">
        {/* Horizontal sliding track */}
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="carousel-slide">
              {/* Background Art */}
              <div
                className="slide-image"
                style={{ backgroundImage: `url(${slide.image})` }}
              />

              {/* Bottom Dark Gradient for readability */}
              <div className="slide-gradient" />

              {/* Slide Text Content */}
              <div className="slide-content">
                <h2 className="slide-line-1">{slide.line1}</h2>
                <h2 className="slide-line-2">{slide.line2}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* Indicator Pills fixed at bottom */}
        <div className="slider-pills" role="tablist" aria-label="Slides">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`slider-pill ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
