class ParticleBackground {
    constructor() {
      this.canvas = document.getElementById('bg-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.particleCount = window.innerWidth < 768 ? 50 : 100; // 响应式粒子数量
  
      // 初始化
      this.initCanvas();
      this.createParticles();
      this.animate();
  
      // 事件监听
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  
    initCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx.fillStyle = '#030a1f';
    }
  
    createParticles() {
      const colors = ['#4facfe55', '#00f2fe55', '#7c4dff55'];
      
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          angle: Math.random() * Math.PI * 2
        });
      }
    }
  
    drawParticle(particle) {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
    }
  
    updateParticles() {
      this.particles.forEach(particle => {
        // 更新位置
        particle.x += Math.cos(particle.angle) * 0.5 + particle.speedX;
        particle.y += Math.sin(particle.angle) * 0.5 + particle.speedY;
        particle.angle += 0.01;
  
        // 边界检测
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
      });
    }
  
    drawConnections() {
      const connectionDistance = 150;
      
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
  
          if (dist < connectionDistance) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = `${p1.color}${(1 - dist/connectionDistance).toFixed(2)}`;
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }
    }
  
    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.particles.forEach(particle => this.drawParticle(particle));
      this.drawConnections();
      this.updateParticles();
  
      requestAnimationFrame(this.animate.bind(this));
    }
  
    handleResize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.particles = [];
      this.createParticles();
    }
  }
  
  // 初始化背景
  document.addEventListener('DOMContentLoaded', () => {
    new ParticleBackground();
  });