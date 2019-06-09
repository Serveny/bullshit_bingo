"use strict";

//#region public
exports.similarity = (s1, s2) => {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  let longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  const val = (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  return val;
};

const editDistance = (s1, s2) => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  let costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
      if (i == 0)
          costs[j] = j;
      else {
          if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
          }
      }
      }
      if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

exports.hasDoubleValuesMap = (map, propsToCheck) => {
  for (let i = 0; i < propsToCheck.length; i++) {
    for (const key in map) {
      for (const keyCheck in map) {
        if (key != keyCheck && map[key][propsToCheck[i]] === map[keyCheck][propsToCheck[i]]) {
          return true;
        }
      }
    }
  }
  return false;
}

exports.isValidName = (nameStr) => {
  // TODO
}

//#region Map to Array recursive 
const mapEx = (objToCopy) => {
    if (objToCopy == null) {
      return null;
    }

    let obj = Object.assign( Object.create( Object.getPrototypeOf(objToCopy)), objToCopy);
    if (obj == null) {
      return null;
    }

    for (const prop of Object.keys(obj)) {
      if (obj[prop] instanceof Map) {
        obj[prop] = mapToArr(obj[prop]);
      } else if (typeof(prop) === 'object') {
        prop = mapEx(prop);
      }
    }

    return obj;
  };
  
const mapToArr = (map) => {
  let arr = [];
  for(const key of map.keys()) {
    let item = map.get(key);
    if (typeof(item) === 'object') {
      item = mapEx(item);
    }
    arr.push([key, item]);
  }
  return arr;
}

exports.mapEx = mapEx;
exports.mapToArr = mapToArr;
//#endregion
//#endregion
