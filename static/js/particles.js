// ==========================================
// Interactive Particle System
// Sparkles + Mouse Repel + Click Burst + Glow
// ==========================================

class Particle {
    constructor(canvas, x, y, isSparkle = false) {
        this.canvas = canvas;
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.isSparkle = isSparkle;

        // Size and appearance
        this.size = isSparkle ? Math.random() * 4 + 2 : Math.random() * 3 + 1;
        this.baseSize = this.size;

        // Movement
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = isSparkle ? Math.random() * -3 - 1 : (Math.random() - 0.5) * 0.5;

        // Visual properties
        this.opacity = Math.random() * 0.5 + 0.3;
        this.baseOpacity = this.opacity;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;

        // Sparkle animation
        this.twinkleSpeed = Math.random() * 0.05 + 0.02;
        this.twinkleOffset = Math.random() * Math.PI * 2;

        // Glow
        this.glowIntensity = Math.random() * 0.5 + 0.5;

        // Lifespan for burst particles
        this.life = isSparkle ? 1 : null;
        this.decay = isSparkle ? Math.random() * 0.02 + 0.01 : 0;

        // Color - emerald green variations
        this.hue = 160 + Math.random() * 20 - 10; // Green range
        this.saturation = 70 + Math.random() * 30;
        this.lightness = 50 + Math.random() * 20;
    }

    update(mouseX, mouseY, deltaTime) {
        // Twinkle effect
        const twinkle = Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset);
        this.opacity = this.baseOpacity + twinkle * 0.2;
        this.size = this.baseSize + twinkle * 0.5;

        // Rotation
        this.rotation += this.rotationSpeed;

        // Apply friction
        this.speedX *= 0.98;
        this.speedY *= 0.98;

        // Movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Gentle floating motion for regular particles
        if (!this.isSparkle) {
            this.y -= 0.2;
            this.x += Math.sin(Date.now() * 0.001 + this.twinkleOffset) * 0.1;
        }

        // Life decay for burst particles
        if (this.isSparkle) {
            this.life -= this.decay;
            this.opacity = this.life * this.baseOpacity;
            this.size = this.life * this.baseSize;
        }

        // Wrap around edges (for regular particles)
        if (!this.isSparkle) {
            if (this.x < -10) this.x = this.canvas.width + 10;
            if (this.x > this.canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = this.canvas.height + 10;
            if (this.y > this.canvas.height + 10) this.y = -10;
        }
    }

    draw(ctx) {
        if (this.opacity <= 0 || this.size <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const color = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.opacity})`;

        // Glow effect
        ctx.shadowBlur = 15 * this.glowIntensity;
        ctx.shadowColor = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.opacity * 0.8})`;

        // Draw sparkle shape (4-pointed star)
        ctx.beginPath();
        ctx.fillStyle = color;

        const outerRadius = this.size;
        const innerRadius = this.size * 0.4;
        const spikes = 4;

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fill();

        // Add center glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.5);
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 80%, ${this.opacity})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isDead() {
        return this.isSparkle && this.life <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particleCanvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;

        // Insert canvas as first child of body
        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = null;
        this.mouseY = null;
        this.lastTime = 0;

        // Configuration
        this.maxParticles = 80;
        this.burstParticles = 20;

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();

        // Create initial particles
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        // Resize handler
        window.addEventListener('resize', () => this.resize());

        // Mouse move for repel effect
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Mouse leave
        document.addEventListener('mouseleave', () => {
            this.mouseX = null;
            this.mouseY = null;
        });

        // Click for burst effect
        document.addEventListener('click', (e) => {
            this.createBurst(e.clientX, e.clientY);
        });
    }

    createBurst(x, y) {
        // Create burst particles
        for (let i = 0; i < this.burstParticles; i++) {
            const particle = new Particle(this.canvas, x, y, true);

            // Burst outward in all directions
            const angle = (Math.PI * 2 * i) / this.burstParticles + Math.random() * 0.5;
            const speed = Math.random() * 8 + 4;
            particle.speedX = Math.cos(angle) * speed;
            particle.speedY = Math.sin(angle) * speed;

            // Random sizes for variety
            particle.size = Math.random() * 6 + 2;
            particle.baseSize = particle.size;

            // Brighter for burst
            particle.lightness = 60 + Math.random() * 20;
            particle.glowIntensity = 1;

            this.particles.push(particle);
        }
    }

    animate(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Clear canvas completely (no trails)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(this.mouseX, this.mouseY, deltaTime);
            particle.draw(this.ctx);

            // Remove dead burst particles
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }

        // Maintain minimum regular particles
        const regularParticles = this.particles.filter(p => !p.isSparkle).length;
        if (regularParticles < this.maxParticles) {
            this.particles.push(new Particle(this.canvas));
        }

        requestAnimationFrame((time) => this.animate(time));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
