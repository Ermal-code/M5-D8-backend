const express = require("express");
const { check, validationResult } = require("express-validator");
const uniqid = require("uniqid");
const { getAttendees, writeAttendees } = require("../../lib/fs-utilities");
const { Transform } = require("json2csv");
const { pipeline } = require("stream");
const { join } = require("path");
const { createReadStream } = require("fs-extra");
const sgMail = require("@sendgrid/mail");

const attendeesRoute = express.Router();

const validateErrors = [
  check("firstName").exists().withMessage("First Name is required"),
  check("secondName").exists().withMessage("Second Name is required"),
  check("email")
    .exists()
    .withMessage("email is required")
    .isEmail()
    .withMessage("This is not a valid email address"),
];

attendeesRoute.get("/", async (req, res, next) => {
  try {
    const attendees = await getAttendees();
    res.status(200).send(attendees);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

attendeesRoute.post("/", validateErrors, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      const attendees = await getAttendees();

      const newAttendee = { ...req.body, _id: uniqid() };

      attendees.push(newAttendee);

      await writeAttendees(attendees);

      res.status(201).send(newAttendee);

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: `${req.body.email}`,
        from: "ermal.aa@live.com",
        subject: "Attendece to the event",
        text:
          "We are happy to inform you that you are accepted to participate our event",
        html: `<strong>
              We are happy to inform you that you are accepted to participate
              our event,
            </strong>`,
      };
      await sgMail.send(msg);
      // res.send("Email sent");
    } else {
      const err = new Error();
      err.message = errors;
      err.httpStatusCode = 400;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

attendeesRoute.get("/csv", (req, res, next) => {
  try {
    const path = join(__dirname, "attendees.json");

    const source = createReadStream(path);

    const file2csv = new Transform({
      fields: ["firstName", "secondName", "email", "timeOfArrival", "_id"],
    });

    res.setHeader("Content-Disposition", "attachement; filename=attendees.csv");
    pipeline(source, file2csv, res, (err) => {
      if (err) {
        console.log(err);
        next(err);
      } else {
        console.log("Done");
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = attendeesRoute;
