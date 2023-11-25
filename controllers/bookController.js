const Book = require("../models/book");
const Author = require("../models/author");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");



exports.index = asyncHandler(async (req, res, next) => {
    // Get details of books, authors counts (in parallel)
    const [
      numBooks,
      numAuthors,
    ] = await Promise.all([
      Book.countDocuments({}).exec(),
      Author.countDocuments({}).exec()
    ]);
  
    res.render("index", {
      title: "Local Library Home",
      book_count: numBooks,
      author_count: numAuthors
    });
  });


// Display list of all books.
  exports.book_list = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, "title author")
      .sort({ title: 1 })
      .populate("author")
      .exec();
  
    res.render("book_list", { title: "Book List", book_list: allBooks });
  });

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances for specific book
  const [book] = await Promise.all([
    Book.findById(req.params.id).populate("author").exec(),
  ]);

  if (book === null) {
    // No results.
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }


    res.render("book_detail", {
    title: book.title,
    book: book,

    });
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  // Get all authors, which we can use for adding to our book.
  const [allAuthors] = await Promise.all([
    Author.find().exec()
  ]);

  res.render("book_form", {
    title: "Create Book",
    authors: allAuthors
  });
});


// Handle book create on POST.
exports.book_create_post = [

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors  for form.
      const [allAuthors] = await Promise.all([
        Author.find().exec()
      ]);

      res.render("book_form", {
        title: "Update Book",
        authors: allAuthors,
        book: book,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save book.
      await book.save();
      res.redirect(book.url);
    }
  }),
];


// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  //detail des livres
  const livre= await Book.findById(req.params.id).exec();
  if (livre===null){
    res.redirect("/catalog/book");
  }
  res.render("book_delete",{
    title: "SUPPRIMER Livre",
    livre : livre,
  });
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  //detail livre
  await Book.findByIdAndDelete(req.params.id);
  res.redirect("/catalog/books");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  // Get all authors, which we can use for adding to our book.
  const [allAuthors] = await Promise.all([
    Author.find().exec()

  ]);
  const book = await Book.findById(req.params.id);

  res.render("book_form", {
    title: "Update book",
    authors: allAuthors,
    book:book
  });
});

// Handle book update on POST.
exports.book_update_post = [

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors  for form.
      const [allAuthors] = await Promise.all([
        Author.find().exec()
      ]);

      res.render("book_form", {
        title: "Create Book",
        authors: allAuthors,
        book: book,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save book.
      await Book.findByIdAndUpdate(req.params.id,book);
      res.redirect(book.url);
    }
  }),
];
