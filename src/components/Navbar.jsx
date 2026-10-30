
/* Calavera mexicana de temporada */
.calavera-temporada {
  animation: calaveraFloat 3s ease-in-out infinite;
  transform-origin: center;
  filter: drop-shadow(0 0 5px rgba(255, 166, 0, 0.65));
}

@keyframes calaveraFloat {
  0%, 100% {
    transform: translateY(0) rotate(-3deg);
  }

  50% {
    transform: translateY(-5px) rotate(3deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .calavera-temporada {
    animation: none;
  }
}
