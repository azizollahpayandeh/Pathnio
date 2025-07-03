import React, { useEffect, useState } from 'react';

export default function Landing() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      {/* Background Video Section */}
      <section className="relative w-full h-[60vh] bg-black">
        {/* اینجا ویدیو بزنی */}
        {/* <video autoPlay loop muted className="w-full h-full object-cover">
          <source src="/your-video.mp4" type="video/mp4" />
        </video> */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Header */}
        <header className="absolute inset-0 flex items-center justify-center">
          <h1
            className={`text-5xl font-bold text-gray-700 text-center max-w-4xl px-4
              transition-transform duration-700 ease-in-out
              ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          >
            خوش آمدید به شرکت ما – پیشرو در نوآوری و کیفیت
          </h1>
        </header>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-gray-800 text-center">
        <h2 className="text-3xl font-semibold mb-6 text-gray-700">درباره ما</h2>
        <p className="text-lg leading-relaxed">
          شرکت ما با سال‌ها تجربه در زمینه فناوری و ارائه خدمات حرفه‌ای، 
          همواره در تلاش است تا بهترین راه‌حل‌ها را برای مشتریان خود فراهم کند. 
          ما با بهره‌گیری از تیم متخصص و فناوری‌های روز دنیا، به رشد و توسعه پایدار می‌اندیشیم.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-gray-600 text-sm mt-auto">
        <p>
          © ۲۰۲۵ شرکت ما. تمام حقوق محفوظ است. این یک متن توضیح خیالی برای بخش فوتر است که می‌تواند شامل اطلاعات تماس، لینک‌های مهم یا شعار شرکت باشد.
        </p>
      </footer>
    </div>
  );
}
