// src/components/SharePondModal.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { API_CONFIG } from '../config/api';
import { Link } from 'react-router-dom';

export const shareUrlPrefix = `${API_CONFIG.BASE_URL}/pond-card/`;

export default function SharePondModal({ isOpen, onClose, pond }) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [pondInfo, setPondInfo] = useState('');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const iconsContainerRef = useRef(null);

  useEffect(() => {
    if (pond) {
      const url = pond.public_url_suffix ? `${shareUrlPrefix}${pond.public_url_suffix}` : `${shareUrlPrefix}${pond.id}`;
      setShareUrl(url);
      
      const infoText = `Пруд "${pond.name}" в Knowledge Fishing\n` +
                      `Всего рыб: ${pond.cnt_fishes || 0}\n` +
                      `Готовы к рыбалке: ${pond.cnt_ready_fishes || 0}\n\n` +
                      `Ссылка: ${url}`;
      setPondInfo(infoText);
    }
  }, [pond]);

  const handleClose = useCallback(() => {
    setCopied(false);
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Не удалось скопировать ссылку: ', err);
      });
  };

  const updateScrollButtons = useCallback(() => {
    const container = iconsContainerRef.current;
    if (container) {
      const showLeft = container.scrollLeft > 0;
      const showRight = container.scrollLeft + container.clientWidth < container.scrollWidth;
      
      setShowLeftArrow(showLeft);
      setShowRightArrow(showRight);
    }
  }, []);

  const scrollLeft = () => {
    if (iconsContainerRef.current) {
      iconsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (iconsContainerRef.current) {
      iconsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    
    const timer = setTimeout(updateScrollButtons, 100);
    
    return () => {
      window.removeEventListener('resize', updateScrollButtons);
      clearTimeout(timer);
    };
  }, [isOpen, updateScrollButtons]);

  const handleScroll = () => {
    updateScrollButtons();
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`Вы можете скопировать мой пруд в Knowledge Fishing, указав при создании пруда ссылку:\n${shareUrl}`);
    window.open(`https://t.me/share/url?url=🥸&text=${text}`, '_blank');
  };

  const handleShareVK = () => {
    const text = encodeURIComponent(`Вы можете скопировать мой пруд в Knowledge Fishing, указав при создании пруда ссылку:\n`);
    window.open(`https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${text}&comment=${text}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Вы можете скопировать мой пруд в Knowledge Fishing, указав при создании пруда ссылку:\n${shareUrl}`);
  	window.open(`https://wa.me/?text=urlencodedtext`, '_blank');
  };

  const handleShareYandexMail = () => {
    const subject = encodeURIComponent(`Пруд "${pond.name}" в Knowledge Fishing`);
    const body = encodeURIComponent(`Вы можете скопировать мой пруд в Knowledge Fishing, указав при создании пруда ссылку:\n${shareUrl}`);
    window.open(`https://mail.yandex.ru/compose?to=&subject=${subject}&body=${body}`, '_blank');
  };

  // const handleShareMax = () => {
  //   const subject = encodeURIComponent(`Пруд "${pond.name}" в Knowledge Fishing`);
  //   const text = encodeURIComponent(`Вы можете скопировать мой пруд в Knowledge Fishing, указав при создании пруда ссылку:\n ${pond.name}`);
  //   window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  // };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen || !pond) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-[500px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Крестик закрытия в правом верхнем углу */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-transparent border-none text-2xl cursor-pointer text-gray-600 w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ease-in-out z-10 hover:bg-gray-100 hover:text-gray-800"
        >
          ×
        </button>
        
        {/* Заголовок - фиксированный */}
        <h2 className="m-0 mb-5 text-2xl font-extrabold text-[#013b45] text-center pr-10 flex-shrink-0">
          Поделиться прудом "{pond.name}"
        </h2>
        
        {/* Основной контент - прокручиваемый с правильным отступом */}
        <div className="flex-1 overflow-auto flex flex-col min-h-0 pr-5 -mr-5">
          {/* Ссылка для общего доступа */}
          <div className="mb-5 flex-shrink-0 relative">
            <label className="block mb-2 font-semibold text-lg text-[#34495e] uppercase tracking-wider">
              ССЫЛКА НА ВАШ ПРУД:
            </label>
            <div className="relative flex items-stretch">
							<div className="text-base text-[#0d1821] leading-normal whitespace-nowrap overflow-x-auto overflow-y-hidden bg-white p-2 rounded-l border border-gray-300 border-r-0 font-mono flex-1 select-all scrollbar-thin scrollbar-thumb-gray-400">
								{shareUrl}
							</div>
							
							{/* Иконка для копирования */}
							<div 
								onClick={handleCopyLink}
								className="bg-sea-blue cursor-pointer w-10 flex items-center justify-center rounded-r border border-gray-300 border-l-0 z-10 transition-all duration-300 ease-in-out shadow hover:opacity-100 hover:shadow-md"
								title="Копировать ссылку"
							>
								{/* SVG иконка копирования */}
								<svg 
									xmlns="http://www.w3.org/2000/svg" 
									width="20" 
									height="20" 
									viewBox="0 0 24 24" 
									fill="none" 
									stroke="#8ff0edff" 
									strokeWidth="2.5"
								>
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
								</svg>
							</div>
						</div>
            <div>
              <p className="mt-2 text-sm text-gray-600 italic">
                Отправьте эту ссылку другому пользователю, чтобы он смог скопировать ваш пруд
              </p>
              {/* Сообщение об успешном копировании */}
              {copied && (
                <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-green-500 text-white text-sm rounded whitespace-nowrap z-50 shadow-lg animate-fadeInOut">
                  Скопировано!
                </div>
              )}

              {/* Добавляем стили для анимации */}
              <style>{`
                @keyframes fadeInOut {
                  0% { opacity: 0; }
                  20% { opacity: 1; }
                  80% { opacity: 1; }
                  100% { opacity: 0; }
                }
                .animate-fadeInOut {
                  animation: fadeInOut 2s ease;
                }
              `}</style>
            </div>
          </div>

          {/* Квадратные кнопки для соцсетей с горизонтальной прокруткой */}
          <div className="mb-5 flex-shrink-0">
            <label className="block mb-2 font-semibold text-lg text-[#34495e] uppercase tracking-wider">
              ПОДЕЛИТЬСЯ В
            </label>
            
            {/* Контейнер для иконок с относительным позиционированием */}
            <div className="relative">
              {/* Контейнер с иконками - горизонтальная прокрутка */}
              <div 
                ref={iconsContainerRef}
                onScroll={handleScroll}
                className="flex gap-3 overflow-x-auto overflow-y-hidden p-2.5 scrollbar-thin scrollbar-thumb-gray-400 relative z-10 xs:justify-center"
              >
                {/* Telegram */}
                <button
                  onClick={handleShareTelegram}
                  title="Поделиться в Telegram"
                  className="w-[60px] h-[60px] min-w-[60px] border-none rounded-xl bg-[#0088cc] cursor-pointer flex items-center justify-center transition-all duration-300 ease-in-out p-0 flex-shrink-0 hover:bg-[#0077b5] hover:scale-110"
                >
									<img 
										src={`${process.env.PUBLIC_URL}/assets/tg-icon.png`} 
										alt="Поделиться в Telegram"
										className="transition-transform duration-200 rounded-xl"
									/>
								</button>

                {/* VK (ВКонтакте) */}
                <button
                  onClick={handleShareVK}
                  title="Поделиться во ВКонтакте"
                  className="w-[60px] h-[60px] min-w-[60px] border-none rounded-xl bg-[#4C75A3] cursor-pointer flex items-center justify-center transition-all duration-300 ease-in-out p-0 flex-shrink-0 hover:bg-[#3a5a80] hover:scale-110"
                >
									<img 
										src={`${process.env.PUBLIC_URL}/assets/vk-icon.jpg`} 
										alt="Поделиться в Telegram"
										className="transition-transform duration-200 rounded-xl"
									/>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  title="Поделиться в WhatsApp"
                  className="w-[60px] h-[60px] min-w-[60px] border-none rounded-xl bg-[#25D366] cursor-pointer flex items-center justify-center transition-all duration-300 ease-in-out p-0 flex-shrink-0 hover:bg-[#1da851] hover:scale-110"
                >
									<img 
										src={`${process.env.PUBLIC_URL}/assets/whatsapp-icon.jpg`} 
										alt="Поделиться в Telegram"
										className="transition-transform duration-200 rounded-xl"
									/>
                </button>

                {/* Mail.ru (Макс)
                <button
                  onClick={handleShareMax}
                  title="Поделиться в MAX"
                  className="w-[60px] h-[60px] min-w-[60px] border-none rounded-xl bg-[#168DE2] cursor-pointer flex items-center justify-center transition-all duration-300 ease-in-out p-0 flex-shrink-0 hover:bg-[#0f6bb8] hover:scale-110"
                >
									<img 
										src={`${process.env.PUBLIC_URL}/assets/max-icon.jpg`} 
										alt="Поделиться в Telegram"
										className="transition-transform duration-200 rounded-xl"
									/>
                </button> */}

                {/* Яндекс Почта */}
                <button
                  onClick={handleShareYandexMail}
                  title="Поделиться через Яндекс Почту"
                  className="w-[60px] h-[60px] min-w-[60px] border-none rounded-xl bg-[#FC3F1D] cursor-pointer flex items-center justify-center transition-all duration-300 ease-in-out p-0 flex-shrink-0 hover:bg-[#d32f0d] hover:scale-110"
                >
									<img 
										src={`${process.env.PUBLIC_URL}/assets/ya-mail-icon.png`} 
										alt="Поделиться в Telegram"
										className="transition-transform duration-200 rounded-xl"
									/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
