/**
 * Converts a JSON object into FormData
 * @param data - JSON object to convert
 * @returns FormData object
 */
export const jsonToFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  const appendToFormData = (obj: any, prefix = '') => {
    // Handle arrays
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const key = `${prefix}[${index}]`;
        if (item === null) {
          formData.append(key, '');
        } else if (typeof item === 'object' && !(item instanceof File || item instanceof Blob)) {
          appendToFormData(item, key);
        } else {
          formData.append(key, item);
        }
      });
    } 
    // Handle objects (excluding Files, Blobs, and null)
    else if (obj !== null && typeof obj === 'object' && !(obj instanceof File || obj instanceof Blob || obj instanceof Date)) {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value === null) {
          formData.append(newKey, '');
        } else if (typeof value === 'object' && !(value instanceof File || value instanceof Blob || value instanceof Date)) {
          appendToFormData(value, newKey);
        } else {
          formData.append(newKey, value);
        }
      });
    } 
    // Handle primitive values, Files, Blobs, and Dates
    else {
      if (obj instanceof Date) {
        formData.append(prefix, obj.toISOString());
      } else if (obj === null || obj === undefined) {
        formData.append(prefix, '');
      } else {
        formData.append(prefix, obj);
      }
    }
  };
  
  appendToFormData(data);
  return formData;
};

/**
 * Converts FormData into a JSON object
 * @param formData - FormData to convert
 * @returns JSON object
 */
export const formDataToJson = (formData: FormData): Record<string, any> => {
  const result: Record<string, any> = {};
  
  for (const [key, value] of formData.entries()) {
    // Handle array notation like 'users[0].name'
    if (key.includes('[') && key.includes(']')) {
      const matches = [...key.matchAll(/\[(\d+)\]/g)];
      const parts = key.split(/\[\d+\]\.|\[\d+\]|\./);
      
      let current = result;
      const path = parts[0];
      
      if (!current[path]) {
        current[path] = matches.length > 0 ? [] : {};
      }
      
      let currentObj = current[path];
      
      // Process array indices
      for (let i = 0; i < matches.length; i++) {
        const index = parseInt(matches[i][1], 10);
        const nextPart = parts[i + 1];
        
        // Ensure we're working with an array
        if (!Array.isArray(currentObj)) {
          currentObj = [];
          current[path] = currentObj;
        }
        
        // TypeScript type assertion to help the compiler understand this is now an array
        const currentArray = currentObj as any[];
        
        // Ensure the array is long enough
        while (currentArray.length <= index) {
          currentArray.push({});
        }
        
        if (i === matches.length - 1 && nextPart === '') {
          // Last part is empty, meaning we're at a leaf value in an array
          currentArray[index] = value;
        } else {
          // More nesting
          if (!currentArray[index]) {
            currentArray[index] = {};
          }
          
          if (i === matches.length - 1 && nextPart) {
            // Handle the remaining part after the last array index
            const obj = currentArray[index] as Record<string, any>;
            if (!obj[nextPart]) {
              obj[nextPart] = value;
            }
          } else {
            current = currentArray[index] as Record<string, any>;
            currentObj = current;
          }
        }
      }
    }
    // Handle dotted notation like 'user.name'
    else if (key.includes('.')) {
      const parts = key.split('.');
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as Record<string, any>;
      }
      
      current[parts[parts.length - 1]] = value;
    }
    // Simple key-value
    else {
      result[key] = value;
    }
  }
  
  return result;
};