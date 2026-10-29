import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";

// 1. لازم dotenv تشتغل في أول سطر خالص عشان تقرأ متغيرات البيئة
env.config();

const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT || 3000;
const saltRounds = 10;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(express.json());

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect()
  .then(() => console.log("Database connected successfully! 🚀"))
  .catch((err) => console.error("Database connection error:", err));

async function getNotes(userEmail) {
  const notes = await db.query("SELECT * FROM notes WHERE email = $1", [
    userEmail,
  ]);
  return notes.rows;
}

app.get("/api/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return console.log("Error destroying session:", err);
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });
});

app.get("/api/notes", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }

  const notes = await getNotes(req.user.email);
  res.json({
    notes: notes,
  });
});

app.post("/api/notes", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }

  const newNote = {
    title: req.body.title,
    content: req.body.content,
  };

  const result = await db.query(
    "INSERT INTO notes (title, content, email) VALUES ($1, $2, $3) RETURNING *",
    [newNote.title, newNote.content, req.user.email],
  );

  res.status(201).json(result.rows[0]);
});

app.delete("/api/notes/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  const id = Number(req.params.id);
  await db.query("DELETE FROM notes WHERE id = $1", [id]);
  const notes = await getNotes(req.user.email);
  res.json(notes);
});

app.patch("/api/notes/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }

  const id = Number(req.params.id);
  const editNote = req.body;

  await db.query("UPDATE notes SET title = $1, content = $2 WHERE id = $3", [
    editNote.title,
    editNote.content,
    id,
  ]);

  const notes = await getNotes(req.user.email);
  res.json(notes);
});

app.get("/api/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res
      .status(401)
      .json({ isAuthenticated: false, message: "غير مسجل الدخول" });
  }
});

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "الإيميل مسجل مسبقاً!" });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
          return res
            .status(500)
            .json({ success: false, message: "خطأ في تشفير الباسورد" });
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash],
          );
          const user = result.rows[0];

          req.login(user, (err) => {
            if (err) {
              console.error("Error logging in after register:", err);
              return res.status(500).json({
                success: false,
                message: "حدث خطأ أثناء تسجيل الدخول",
              });
            }

            return res.status(200).json({
              success: true,
              message: "تم التسجيل بنجاح!",
              user: user,
            });
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
});

app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({
    success: true,
    message: "تم تسجيل الدخول بنجاح يا معلم!",
  });
});

passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;

        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false, { message: "Incorrect password" });
            }
          }
        });
      } else {
        return cb(null, false, { message: "User not found" });
      }
    } catch (err) {
      console.log(err);
      return cb(err);
    }
  }),
);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

app.get(
  "/auth/google/notes",
  passport.authenticate("google", {
    failureRedirect: FRONTEND_URL,
  }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/home`);
  },
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/auth/google/notes`,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, Profile, cb) => {
      try {
        console.log(Profile);
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          Profile.email,
        ]);
        if (result.rows.length === 0) {
          // 2. تم تصحيح خطأ RETURNING *d إلى RETURNING *
          const newUser = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [Profile.email, "google"],
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    },
  ),
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  cb(null, result.rows[0]);
});

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
