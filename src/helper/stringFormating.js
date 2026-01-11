export function formatString(str) {
  if (typeof str !== 'string') return str;
  
  return JSON.stringify(str).slice(1, -1);
}

export function cleanJsonString(jsonString) {
    let result = '';
    let inString = false;
    let cur_str = '';
    let escaped = false;

    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];
        
        if (escaped) {
            // Мы внутри escape-последовательности
            if (inString) {
                // Внутри строки - обрабатываем escape-последовательности
                switch(char) {
                    case 'n': cur_str += '\\n'; break;
                    case 'r': cur_str += '\\r'; break;
                    case 't': cur_str += '\\t'; break;
                    case 'b': cur_str += '\\b'; break;
                    case 'f': cur_str += '\\f'; break;
                    case '"': cur_str += '\\"'; break;
                    case '\\': cur_str += '\\\\'; break;
                    case '/': cur_str += '\\/'; break;
                    case 'u': 
                        // Unicode escape: \uXXXX
                        if (i + 4 < jsonString.length) {
                            cur_str += '\\u' + jsonString.substr(i + 1, 4);
                            i += 4; // Пропускаем 4 символа Unicode
                        } else {
                            cur_str += '\\u';
                        }
                        break;
                    default:
                        // Неизвестная escape-последовательность
                        cur_str += '\\' + char;
                }
            }
            escaped = false;
            continue;
        }
        
        if (char === '\\') {
            // Начало escape-последовательности
            escaped = true;
            continue;
        }
        
        if (char === '"') {
            if (inString) {
                // Конец строки
                result += '"' + formatString(cur_str) + '"';
                cur_str = '';
            }
            inString = !inString;
        } else {
            if (inString) {
                // Внутри строки - проверяем специальные символы
                if (char === '\n') {
                    cur_str += '\\n';
                } else if (char === '\r') {
                    cur_str += '\\r';
                } else if (char === '\t') {
                    cur_str += '\\t';
                } else if (char === '\b') {
                    cur_str += '\\b';
                } else if (char === '\f') {
                    cur_str += '\\f';
                } else {
                    cur_str += char;
                }
            } else {
                if (!/\s/.test(char)) {
                    result += char;
                }
            }
        }
    }
    
    // Если остались необработанные данные (например, незакрытая строка)
    if (cur_str) {
        result += '"' + formatString(cur_str) + '"';
    }
    
    return result;
}

export const formatStringForDisplay = (jsonString) => {
  // Сначала обрабатываем экранированные символы
  let result = jsonString
    .replace(/\\n/g, '<br>')
    .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    .replace(/\\r/g, '')
    .replace(/\\f/g, '')
    .replace(/\\b/g, '')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"')
    
    // Временно заменяем экранированные _ и ^ чтобы они не участвовали в форматировании
    .replace(/\\_/g, '＄UNDERSCORE＄')
    .replace(/\\\^/g, '＄CARET＄');
  
  // Теперь обрабатываем форматирование
  // Важно: жирный первым, так как внутри могут быть индексы
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Верхний индекс через ^
  result = result.replace(/\^([^^]+)\^/g, '<sup>$1</sup>');
  
  // Нижний индекс через _
  result = result.replace(/_([^_]+)_/g, '<sub>$1</sub>');
  
  // Возвращаем экранированные символы
  result = result
    .replace(/＄UNDERSCORE＄/g, '_')
    .replace(/＄CARET＄/g, '^');
  
  return result;
};