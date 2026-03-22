const success = (data = null, message = '操作成功') => {
  return {
    code: 200,
    message,
    data
  };
};

const error = (message = '操作失败', code = 500) => {
  return {
    code,
    message,
    data: null
  };
};

module.exports = {
  success,
  error
};
