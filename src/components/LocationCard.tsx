.flip-card {
  perspective: 1200px;
}
.flip-card-inner {
  transition: transform 0.6s ease;
  transform-style: preserve-3d;
}
.flip-card-front,
.flip-card-back {
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
}
.flip-card-back {
  transform: rotateY(180deg);
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
