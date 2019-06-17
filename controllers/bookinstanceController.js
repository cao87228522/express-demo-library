const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

const async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// 显示完整的藏书列表
exports.bookinstance_list = (req, res, next) => {
  BookInstance.find()
    .populate('book')
    .exec((err, list_bookinstance) => {
      if (err) return next(err);
      res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstance});
    })
};

// 为每位藏书显示详细信息的页面
exports.bookinstance_detail = function(req, res, next) {
  BookInstance.findById(req.params.id)
  .populate('book')
  .exec(function (err, bookinstance) {
    if (err) { return next(err); }
    if (bookinstance==null) { // No results.
      var err = new Error('Book copy not found');
      err.status = 404;
      return next(err);
      }
    // Successful, so render.
    res.render('bookinstance_detail', { title: 'Book:', bookinstance:  bookinstance});
  })
};

// 由 GET 显示创建藏书的表单
exports.bookinstance_create_get = function(req, res, next) {       

  Book.find({},'title')
  .exec(function (err, books) {
    if (err) { return next(err); }
    // Successful, so render.
    res.render('bookinstance_form', {title: 'Create BookInstance', book_list:books});
  });
  
};
// 由 POST 处理藏书创建操作
exports.bookinstance_create_post = [

  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
  
  // Sanitize fields.
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),
  
  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a BookInstance object with escaped and trimmed data.
      var bookinstance = new BookInstance(
        { book: req.body.book,
          imprint: req.body.imprint,
          status: req.body.status,
          due_back: req.body.due_back
         });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values and error messages.
          Book.find({},'title')
              .exec(function (err, books) {
                  if (err) { return next(err); }
                  // Successful, so render.
                  res.render('bookinstance_form', { title: 'Create BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance });
          });
          return;
      }
      else {
          // Data from form is valid.
          bookinstance.save(function (err) {
              if (err) { return next(err); }
                 // Successful - redirect to new record.
                 res.redirect(bookinstance.url);
              });
      }
  }
];
// 由 GET 显示删除藏书的表单
exports.bookinstance_delete_get = (req, res) => { res.send('未实现：藏书删除表单的 GET'); };

// 由 POST 处理藏书删除操作
exports.bookinstance_delete_post = (req, res) => { res.send('未实现：删除藏书的 POST'); };

// 由 GET 显示更新藏书的表单
exports.bookinstance_update_get = (req, res) => { res.send('未实现：藏书更新表单的 GET'); };

// 由 POST 处理藏书更新操作
exports.bookinstance_update_post = (req, res) => { res.send('未实现：更新藏书的 POST'); };