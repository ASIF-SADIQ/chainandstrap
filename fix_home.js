const fs = require('fs');
let code = fs.readFileSync('app/page.js', 'utf8');

const target = `{/* Background gradient & particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/10 via-bg-primary to-bg-primary z-0" />
        <div className="particles">`;

const replacement = `{/* Background video from Pinterest */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        >
          <source src="https://v1.pinimg.com/videos/iht/expMp4/21/d0/b8/21d0b88e130fccaf542b1ec7c5c2ff26_720w.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 z-0" />

        <div className="particles z-10">`;

code = code.replace(target, replacement);
fs.writeFileSync('app/page.js', code);
