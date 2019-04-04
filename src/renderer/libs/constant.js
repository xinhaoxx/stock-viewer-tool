const apiUrl = 'http://qt.gtimg.cn/' // 接口地址
const timeSpan = 3000 // 时间间隔
const stockIndex = ['sh000001', 'sz399001', 'sz399006'] // 三大指数

/**
 * 比较两个金额大小并返回相应类名
 * @param value 被比较值
 * @param compare 比较值
 * @returns {string} 类名
 */
const comparePrice = (value, compare) => {
  return value > compare ? 'gain-more' : (value < compare ? 'gain-less' : '')
}

/**
 * 将金额转为万为单位
 * @description 有万则加万字，没有则不显示万字
 * @param number {string|number} - 需要被转换的金额
 * @return {string} 返回转换后的金额字符串
 */
const transVolume = (number) => {
  number = parseInt(number) + ''
  if (number.length > 4) {
    let integer = number.substring(0, number.length - 4)
    let decimal = integer.length > 3 ? '' : ('.' + number.substring(number.length - 5, number.length - 3))
    return integer + decimal + '万'
  } else {
    return number
  }
}

/**
 * 转换日期时间字符串
 * @param str {string} - 需要转换的时间字符串
 * @returns {string} - 转换后的时间字符串
 */
const transDate = (str) => {
  let year = str.substring(0, 4)
  let month = str.substring(4, 6)
  let day = str.substring(6, 8)
  let hour = str.substring(8, 10)
  let minute = str.substring(10, 12)
  let second = str.substring(12, 14)
  return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`
}

/**
 * 获取市场名称
 * @param code {string} - 市场代码
 * @returns {string} - 中文市场名称
 */
const transMarketName = (code) => {
  switch (code) {
    case 'sh':
      return '上证'
    case 'sz':
      return '深证'
    case 'hk':
      return '港股'
  }
}

export {
  apiUrl,
  timeSpan,
  stockIndex,
  comparePrice,
  transVolume,
  transDate,
  transMarketName
}
