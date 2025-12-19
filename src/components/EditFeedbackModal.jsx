import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import { feedbackService } from '../services/feedbackService';

// Маппинг типов с бэкенда на русские названия
const FEEDBACK_TYPE_MAPPING = {
  'PROBLEM': 'Проблема',
  'REVIEW': 'Отзыв',
  'SUGGESTION': 'Предложение'
};

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return 'Не указано';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Функция для получения имени пользователя
const getUserName = (userId) => {
  return `Пользователь #${userId?.slice(0, 8) || 'unknown'}`;
};

// Стили для модального окна
const modalStyles = `
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  padding: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-close:hover {
  background-color: #f5f5f5;
  color: #c62828;
}

.modal-body {
  padding: 24px 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.readonly-field {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
  min-height: 20px;
}

.feedback-text-preview {
  padding: 16px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: 14px;
  color: #333;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: normal;
  user-select: none;
  padding: 8px 0;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0;
}

.checkbox-label span {
  font-size: 14px;
  color: #333;
}

.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;
  min-height: 100px;
  box-sizing: border-box;
}

.form-group textarea:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.modal-error {
  padding: 12px 16px;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  color: #c62828;
  font-size: 14px;
  margin-top: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 32px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

.btn-primary:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Адаптивность */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    margin: 10px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
  
  .modal-header h2 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    flex-direction: column;
    padding: 20px;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
`;

// Компонент для добавления стилей
function ModalStyles() {
  return <style dangerouslySetInnerHTML={{ __html: modalStyles }} />;
}

// Компонент модального окна редактирования отзыва
function EditFeedbackModal({ feedback, isOpen, onClose, onSave }) {
  const [editedFeedback, setEditedFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (feedback) {
      setEditedFeedback({ 
        ...feedback,
        solution: feedback.solution || ''
      });
      setError(null);
    }
  }, [feedback]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedFeedback(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editedFeedback) return;
    
    setIsSaving(true);
    setError(null);

    try {
      // Преобразуем данные для отправки на бэкенд
      const feedbackToSend = {
        id: editedFeedback.id,
        solved: editedFeedback.solved || false,
        solution: editedFeedback.solution || ''
      };

      console.log('Отправка данных на сервер:', feedbackToSend);
      
      const updatedFeedback = await feedbackService.UpdateFeedback(feedbackToSend);
      console.log('Ответ от сервера:', updatedFeedback);
      
      onSave(updatedFeedback);
      onClose();
    } catch (err) {
      console.error('Ошибка при обновлении отзыва:', err);
      setError(err.message || 'Произошла ошибка при сохранении изменений. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !feedback || !editedFeedback) return null;

  const displayType = FEEDBACK_TYPE_MAPPING[feedback.type] || feedback.type;
  const isProblem = feedback.type === 'Проблема';

  return (
    <>
      <ModalStyles />
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Просмотр обратной связи</h2>
            <button 
              className="modal-close" 
              onClick={onClose}
              aria-label="Закрыть"
              disabled={isSaving}
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label>Тип обратной связи:</label>
                <div className="readonly-field">
                  {displayType}
                </div>
              </div>

              {/* <div className="form-group">
                <label>ID фидбека:</label>
                <div className="readonly-field">
                  {feedback.id}
                </div>
              </div> */}

              <div className="form-group">
                <label>Дата создания:</label>
                <div className="readonly-field">
                  {formatDate(feedback.created_at)}
                </div>
              </div>

              <div className="form-group">
                <label>Пользователь:</label>
                <div className="readonly-field">
                  {getUserName(feedback.user_id)}
                </div>
              </div>

              <div className="form-group">
                <label>Текст фидбэка:</label>
                <div className="feedback-text-preview">
                  {feedback.text}
                </div>
              </div>

              { (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="solved"
                      checked={editedFeedback.solved || false}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                    <span> Отметить решенным</span>
                  </label>
                  {/* <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    {editedFeedback.solved 
                      ? 'Проблема будет отмечена как решённая'
                      : 'Проблема будет отмечена как нерешённая'
                    }
                  </p> */}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="solution">
                  {isProblem ? 'Решение проблемы' : 'Комментарий администратора'}:
                </label>
                <textarea
                  id="solution"
                  name="solution"
                  value={editedFeedback.solution}
                  onChange={handleChange}
                  rows="4"
                  placeholder={isProblem 
                    ? "Опишите решение проблемы или оставьте комментарий..." 
                    : "Оставьте комментарий к отзыву..."
                  }
                  disabled={isSaving}
                />
                {/* <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  Этот текст будет виден пользователю
                </p> */}
              </div>

              {feedback.solved_at && feedback.solved_at > new Date('1970-01-01') && (
                <div className="form-group">
                  <label>Дата решения:</label>
                  <div className="readonly-field">
                    {formatDate(feedback.solved_at)}
                  </div>
                </div>
              )}

              {error && (
                <div className="modal-error">
                  <strong>Ошибка:</strong> {error}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>
                      ⟳
                    </span>
                    Сохранение...
                  </>
                ) : (
                  'Сохранить изменения'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Анимация для спиннера
const spinnerStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export default EditFeedbackModal;