import React, { useState, useEffect, useCallback } from 'react';
import { feedbackService } from '../services/feedbackService';
import { statsService } from '../services/statsService';
import EditFeedbackModal from '../components/EditFeedbackModal'

// Типы обратной связи - теперь используем значения с бэкенда
const FEEDBACK_TYPES = {
  PROBLEM: 'Проблема',
  REVIEW: 'Отзыв',
  SUGGESTION: 'Предложение'
};

// Маппинг типов с бэкенда на русские названия
const FEEDBACK_TYPE_MAPPING = {
  'PROBLEM': FEEDBACK_TYPES.PROBLEM,
  'REVIEW': FEEDBACK_TYPES.REVIEW,
  'SUGGESTION': FEEDBACK_TYPES.SUGGESTION
};

// Обратный маппинг для запросов к API
const FEEDBACK_TYPE_REVERSE_MAPPING = {
  [FEEDBACK_TYPES.PROBLEM]: 'Проблема',
  [FEEDBACK_TYPES.REVIEW]: 'Отзыв',
  [FEEDBACK_TYPES.SUGGESTION]: 'Предложение'
};

const PROBLEM_STATUS = {
  RESOLVED: 'решена',
  UNRESOLVED: 'не решена'
};

// Форматирование даты
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Функция для получения имени пользователя (заглушка - в реальном приложении нужно получать с бэкенда)
const getUserName = (userId) => {
  return `Пользователь #${userId?.slice(0, 8) || 'unknown'}`;
};

// Компонент карточки статистики
function StatCard({ title, value, dailyChange, icon, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-card-header">
        <div className="stat-icon" style={{ color }}>
          {icon}
        </div>
        <h3 className="stat-title">{title}</h3>
      </div>
      <div className="stat-value">{(value)}</div>
      {dailyChange !== undefined && dailyChange !== 0 && (
        <div className="stat-change">
          <span className={`change-indicator ${dailyChange > 0 ? 'positive' : 'negative'}`}>
            {dailyChange > 0 ? '↑' : '↓'} {Math.abs(dailyChange)}
          </span>
          <span className="change-label">за вчера</span>
        </div>
      )}
    </div>
  );
}

// Компонент панели статистики
function StatsPanel({ stats, loading, error }) {
  if (loading) {
    return (
      <div className="stats-panel">
        <div className="stats-header">
          <h2>📊 Статистика платформы</h2>
        </div>
        <div className="stats-loading">Загрузка статистики...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-panel">
        <div className="stats-header">
          <h2>📊 Статистика платформы</h2>
        </div>
        <div className="stats-error">Ошибка загрузки статистики</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-panel">
        <div className="stats-header">
          <h2>📊 Статистика платформы</h2>
        </div>
        <div className="stats-empty">Нет данных для отображения</div>
      </div>
    );
  }

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <h2>📊 Статистика платформы</h2>
        <div className="stats-subtitle">Обновлено сегодня</div>
      </div>
      
      <div className="stats-grid">
        <StatCard
          title="Пользователей с логином"
          value={stats.allStats.usersWithLogin}
          dailyChange={stats.lastDayStats.usersWithLogin}
          icon="👤"
          color="#1976d2"
        />
        
        <StatCard
          title="Прудов"
          value={stats.allStats.ponds}
          dailyChange={stats.lastDayStats.ponds}
          icon="🏞️"
          color="#2e7d32"
        />
        
        <StatCard
          title="Рыб"
          value={stats.allStats.fishes}
          dailyChange={stats.lastDayStats.fishes}
          icon="🐟"
          color="#ff9800"
        />
        
        <StatCard
          title="Отзывов"
          value={stats.allStats.feedback}
          dailyChange={stats.lastDayStats.feedback}
          icon="💬"
          color="#9c27b0"
        />
      </div>
    </div>
  );
}

function FeedbackCard({ feedback, onEdit }) {
  // Определяем цвета для разных типов обратной связи
  const getTypeStyles = () => {
    const displayType = FEEDBACK_TYPE_MAPPING[feedback.type] || feedback.type;
    
    switch(displayType) {
      case FEEDBACK_TYPES.PROBLEM:
        return {
          backgroundColor: '#ffebee',
          color: '#c62828'
        };
      case FEEDBACK_TYPES.REVIEW:
        return {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32'
        };
      case FEEDBACK_TYPES.SUGGESTION:
        return {
          backgroundColor: '#e3f2fd',
          color: '#1565c0'
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#424242'
        };
    }
  };

  // Определяем цвета для статуса проблемы
  const getStatusStyles = () => {
    if (feedback.type !== 'Проблема') return null;
    
    return feedback.solved ? {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32'
    } : {
      backgroundColor: '#fff3e0',
      color: '#ef6c00'
    };
  };

  const typeStyles = getTypeStyles();
  const statusStyles = getStatusStyles();
  const displayType = FEEDBACK_TYPE_MAPPING[feedback.type] || feedback.type;

  return (
    <div className="feedback-card">
      <div className="feedback-card-header">
        <div className="feedback-tags">
          <span 
            className="feedback-type-tag"
            style={typeStyles}
          >
            {displayType}
          </span>
          
          {feedback.type === 'Проблема' && statusStyles && (
            <span 
              className="feedback-status-tag"
              style={statusStyles}
            >
              {feedback.solved ? '✓ Решена' : '✗ Не решена'}
            </span>
          )}
        </div>
        
        <span className="feedback-date">
          {formatDate(feedback.created_at)}
        </span>
      </div>
      
      <h3 className="feedback-title">
        {displayType}
      </h3>
      
      <p className="feedback-description">{feedback.text}</p>
      
      {feedback.solution && feedback.solved && (
        <div className="feedback-solution">
          <strong>Решение:</strong> {feedback.solution}
          {feedback.solved_at && feedback.solved_at > new Date('1970-01-01') && (
            <span className="solution-date">
              (решено {formatDate(feedback.solved_at)})
            </span>
          )}
        </div>
      )}
      
      <div className="feedback-footer">
        <div className="feedback-author">
          От: {getUserName(feedback.user_id)}
        </div>
        <button 
          className="edit-feedback-button"
          onClick={() => onEdit(feedback)}
          title="Редактировать отзыв"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function ControlPanel({
  selectedType,
  setSelectedType,
  problemStatus,
  setProblemStatus,
  itemsPerPage,
  setItemsPerPage,
  sortOrder,
  setSortOrder
}) {
  return (
    <div className="control-panel">
      <div className="control-group">
        <label className="control-label">Тип обратной связи:</label>
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="control-select"
        >
          <option value="ALL">Все типы</option>
          <option value={FEEDBACK_TYPES.PROBLEM}>{FEEDBACK_TYPES.PROBLEM}</option>
          <option value={FEEDBACK_TYPES.REVIEW}>{FEEDBACK_TYPES.REVIEW}</option>
          <option value={FEEDBACK_TYPES.SUGGESTION}>{FEEDBACK_TYPES.SUGGESTION}</option>
        </select>
      </div>

      <div className="control-group">
        <label className="control-label">Статус проблемы:</label>
        <select 
          value={problemStatus}
          onChange={(e) => setProblemStatus(e.target.value)}
          className="control-select"
        >
          <option value="ALL">Все статусы</option>
          <option value="RESOLVED">Решена</option>
          <option value="UNRESOLVED">Не решена</option>
        </select>
      </div>

      <div className="control-group">
        <label className="control-label">Показывать:</label>
        <select 
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="control-select"
        >
          <option value={5}>5 записей</option>
          <option value={10}>10 записей</option>
          <option value={100}>100 записей</option>
        </select>
      </div>

      <div className="control-group">
        <label className="control-label">Сортировка:</label>
        <div className="sort-buttons">
          <button
            onClick={() => setSortOrder('newest')}
            className={`sort-button ${sortOrder === 'newest' ? 'sort-button-active' : ''}`}
          >
            Сначала новые
          </button>
          <button
            onClick={() => setSortOrder('oldest')}
            className={`sort-button ${sortOrder === 'oldest' ? 'sort-button-active' : ''}`}
          >
            Сначала старые
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedbackViewer({ onRefreshStats }) {
  // Состояния для фильтров
  const [selectedType, setSelectedType] = useState('ALL');
  const [problemStatus, setProblemStatus] = useState('ALL');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState('newest');
  const [feedbackData, setFeedbackData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Состояния для редактирования
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Функция для загрузки данных с бэкенда
  const loadFeedbackData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Преобразуем параметры для запроса к API
      let get_last = (sortOrder === 'newest');
      
      let solved = null;
      if (problemStatus === 'RESOLVED') {
        solved = true;
      } else if (problemStatus === 'UNRESOLVED') {
        solved = false;
      }
      
      // Преобразуем тип для запроса (обратное маппирование)
      let type = selectedType === 'ALL' ? null : FEEDBACK_TYPE_REVERSE_MAPPING[selectedType];
      
      // Вызываем сервис с параметрами
      const data = await feedbackService.GetFeedback({
        count: itemsPerPage,
        get_last: get_last,
        type: type,
        solved: solved
      });
      
      setFeedbackData(data);
    } catch (err) {
      setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      console.error('Ошибка загрузки отзывов:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, problemStatus, itemsPerPage, sortOrder]);
  
  // Загружаем данные при монтировании и при изменении параметров
  useEffect(() => {
    loadFeedbackData();
  }, [loadFeedbackData]);
  
  // Функция для ручного обновления данных
  const handleRefresh = () => {
    loadFeedbackData();
    if (onRefreshStats) {
      onRefreshStats();
    }
  };

  // Функция для открытия модального окна редактирования
  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback);
    setIsEditModalOpen(true);
  };

  // Функция для сохранения изменений
  const handleSaveFeedback = (updatedFeedback) => {
    // Обновляем данные в списке
    setFeedbackData(prevData =>
      prevData.map(item =>
        item.id === updatedFeedback.id ? updatedFeedback : item
      )
    );
    
    // Обновляем статистику
    if (onRefreshStats) {
      onRefreshStats();
    }
  };

  return (
    <div className="feedback-content-container">
      <ControlPanel
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        problemStatus={problemStatus}
        setProblemStatus={setProblemStatus}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      
      <div className="feedback-content">
        <div className="feedback-header">
          <div className="feedback-stats">
            {isLoading ? (
              'Загрузка...'
            ) : error ? (
              <span style={{ color: '#c62828' }}>{error}</span>
            ) : (
              `Показано ${feedbackData.length} записей`
            )}
          </div>
          
          <button 
            onClick={handleRefresh}
            className="refresh-button"
            disabled={isLoading}
          >
            {isLoading ? 'Обновление...' : '🔄 Обновить данные'}
          </button>
        </div>
        
        {isLoading ? (
          <div className="loading-message">
            Загрузка отзывов...
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button 
              onClick={handleRefresh}
              className="retry-button"
            >
              Повторить попытку
            </button>
          </div>
        ) : feedbackData.length > 0 ? (
          <div className="feedback-list">
            {feedbackData.map((item) => (
              <FeedbackCard 
                key={item.id} 
                feedback={item} 
                onEdit={handleEditFeedback}
              />
            ))}
          </div>
        ) : (
          <div className="no-feedback-message">
            Нет обратной связи, соответствующей выбранным фильтрам
          </div>
        )}
      </div>

      {/* Модальное окно редактирования */}
      <EditFeedbackModal
        feedback={editingFeedback}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveFeedback}
      />
    </div>
  );
}

function Admin() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Загрузка статистики
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      const formattedStats = await statsService.getFormattedStats();
      setStats(formattedStats);
    } catch (err) {
      setStatsError(err.message);
      console.error('Ошибка загрузки статистики:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    
    // Обновляем статистику каждые 5 минут
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadStats]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Панель администратора</h1>
        <p className="app-subtitle">
          Управление платформой: статистика и обратная связь пользователей
        </p>
      </header>
      
      <div className="main-content">
        <div className="content-left">
          <FeedbackViewer onRefreshStats={loadStats} />
        </div>
        
        <div className="content-right">
          <StatsPanel 
            stats={stats}
            loading={statsLoading}
            error={statsError}
          />
        </div>
      </div>
    </div>
  );
}

// CSS стили
const styles = `
.app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.app-header {
  padding: 24px 32px;
  background: linear-gradient(135deg, #1976d2, #2196f3);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.app-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.app-subtitle {
  margin: 8px 0 0 0;
  opacity: 0.9;
  font-size: 16px;
}

.main-content {
  display: flex;
  min-height: calc(100vh - 120px);
}

.content-left {
  flex: 1;
  background-color: #fafafa;
  overflow-y: auto;
}

.content-right {
  width: 350px;
  background-color: white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.feedback-content-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.control-panel {
  padding: 20px 32px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.control-select {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 180px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-select:hover {
  border-color: #999;
}

.control-select:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.sort-buttons {
  display: flex;
  gap: 8px;
}

.sort-button {
  padding: 10px 20px;
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.sort-button:hover {
  background-color: #e9ecef;
  border-color: #ccc;
}

.sort-button-active {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

.sort-button-active:hover {
  background-color: #1565c0;
  border-color: #1565c0;
}

.feedback-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.feedback-stats {
  color: #666;
  font-size: 14px;
  padding: 12px 16px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  flex: 1;
}

.refresh-button {
  padding: 10px 24px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-button:hover {
  background-color: #1565c0;
}

.refresh-button:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.retry-button {
  padding: 10px 24px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 16px;
}

.retry-button:hover {
  background-color: #1565c0;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 60px 40px;
  color: #666;
  background-color: white;
  border-radius: 8px;
  border: 2px dashed #ddd;
  font-size: 16px;
  margin-top: 20px;
}

.error-message {
  border-color: #ffcdd2;
  color: #c62828;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  transition: box-shadow 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.feedback-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feedback-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.feedback-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.feedback-type-tag,
.feedback-status-tag {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
}

.feedback-date {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
}

.feedback-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
}

.feedback-description {
  margin: 0 0 16px 0;
  color: #555;
  line-height: 1.6;
  font-size: 15px;
  white-space: pre-wrap;
}

.feedback-solution {
  margin: 16px 0;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #4caf50;
  color: #333;
  line-height: 1.6;
  font-size: 15px;
}

.feedback-solution strong {
  color: #2e7d32;
}

.solution-date {
  display: block;
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
}

.feedback-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.feedback-author {
  color: #666;
  font-size: 14px;
  font-style: italic;
}

.edit-feedback-button {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-feedback-button:hover {
  background-color: rgba(25, 118, 210, 0.1);
  color: #1565c0;
  transform: scale(1.1);
}

.edit-feedback-button:active {
  transform: scale(0.95);
}

/* Модальное окно стили */
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
  width: 90%;
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
}

.modal-close:hover {
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
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
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
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: normal;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.form-group textarea:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
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
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1565c0;
}

.btn-primary:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-feedback-message {
  text-align: center;
  padding: 60px 40px;
  color: #666;
  background-color: white;
  border-radius: 8px;
  border: 2px dashed #ddd;
  font-size: 16px;
  margin-top: 20px;
}

/* Стили для панели статистики */
.stats-panel {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.stats-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.stats-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-subtitle {
  color: #666;
  font-size: 14px;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.stat-icon {
  font-size: 24px;
}

.stat-title {
  margin: 0;
  font-size: 14px;
  color: #666;
  font-weight: 600;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 8px;
}

.change-indicator {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.change-indicator.positive {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.change-indicator.negative {
  background-color: #ffebee;
  color: #c62828;
}

.change-label {
  font-size: 12px;
  color: #999;
}

.stats-summary {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.stats-summary h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #666;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.stats-loading,
.stats-error,
.stats-empty {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 14px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.stats-error {
  border-color: #ffcdd2;
  color: #c62828;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .content-right {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .control-panel {
    gap: 16px;
  }
  
  .control-select {
    min-width: 160px;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 20px 24px;
  }
  
  .app-header h1 {
    font-size: 24px;
  }
  
  .control-panel {
    flex-direction: column;
    align-items: stretch;
    padding: 20px 24px;
  }
  
  .control-group {
    width: 100%;
  }
  
  .control-select {
    width: 100%;
  }
  
  .sort-buttons {
    width: 100%;
  }
  
  .sort-button {
    flex: 1;
  }
  
  .feedback-content {
    padding: 20px 24px;
  }
  
  .feedback-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .refresh-button {
    width: 100%;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 16px 20px;
  }
  
  .app-header h1 {
    font-size: 20px;
  }
  
  .app-subtitle {
    font-size: 14px;
  }
  
  .feedback-card {
    padding: 20px;
  }
  
  .feedback-card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .feedback-date {
    align-self: flex-end;
  }
  
  .feedback-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .edit-feedback-button {
    align-self: flex-end;
  }
  
  .modal-header h2 {
    font-size: 20px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
`;

// Компонент для добавления стилей
function Styles() {
  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

export default function MainAdmin() {
  return (
    <>
      <Styles />
      <Admin />
    </>
  );
}