const router = require("express").Router();
const Reservations = require("../model/reservation.model");
const {
  checkJWT,
  notRoot,
  userExists,
  isClient,
  isAdmin,
} = require("../middlewares/middlewares");
const { decodeJWT, getToken, validate } = require("../utils/utils");
const { reservationValidator } = require("../validator/validators");
const {sendReservationRequestMessage,sendReservationRejectMessage,sendReservationAcceptMessage, sendReservationUpdatingMessage} = require("../messaging/messaging");
const User = require("../model/user.model");

const RESERVATIONS_PER_DAY = 1;

const validateReservation = (reservation, user_id) => {
  if (!reservation) {
    return { status: 404, message: "Reservation not found" };
  }

  if (reservation.user_id !== user_id) {
    return {
      status: 401,
      message: "You don't have access to that reservation",
    };
  }
};

const sendRejectionOrAcceptMessage = async(reservation, accept, note) => {
  const { email } = await User.findOne({
    where: {
      user_id: reservation.user_id
    }
  });

  accept ? await sendReservationAcceptMessage(reservation,note,email) : await sendReservationRejectMessage(reservation, note, email);
}

const  updateReservation = async (reservation, body) => {
  reservation.people = body.people;
  reservation.date = body.date;
  reservation.time = body.time;
  reservation.status = "pending";
  reservation.note = ""
  await reservation.save();
}

const acceptOrRejectReservation = async (req, res, accept = true) => {
  const setStatus = accept ? "accepted" : "rejected";
  const { note } = req.body;
  const id = req.params.id;
  const reservation = await Reservations.findOne({
    where: {
      reservation_id: id,
    },
  });

  if (!reservation)
    return res
      .status(404)
      .json({ status: 404, message: "Reservation not found" });

  if (reservation.status === setStatus)
    return res.status(400).json({
      status: 400,
      message: `The reservation is already ${setStatus}`,
    });

  reservation.status = setStatus

  await reservation.save()
    try {
      await sendRejectionOrAcceptMessage(reservation, accept, note);
    } catch (error) {
      console.log("Error to send message");
      
    }
 

  return res.json({
    status: 200,
    message: `The reservation is successfully ${setStatus}`,
  });
};



router.get("/", checkJWT, userExists, notRoot, async (req, res) => {
  const token = getToken(req);
  const { rol, user_id } = decodeJWT(token);

  if (rol === "admin") {
    const reservations = await Reservations.findAll();
    return res.json({ status: 200, body: reservations });
  }

  const reservations = await Reservations.findAll({
    where: {
      user_id: user_id,
    },
  });
  console.log();

  return res.json({ status: 200, body: reservations });
});

router.post("/", checkJWT, userExists, isClient, async (req, res) => {
  const token = getToken(req);

  const { user_id,email } = decodeJWT(token);
  const body = req.body;

  const error = validate(body, reservationValidator);
  if (error) return res.status(400).json(error);

  const reservations = await Reservations.findAll({
    where: {
      date: body.date,
      user_id: user_id,
    },
  });

  console.log(reservations.length);

  if (reservations.length >= RESERVATIONS_PER_DAY) {
    return res.status(400).json({
      status: 400,
      message: `You cannot book more than ${RESERVATIONS_PER_DAY} reservations in a day`,
    });
  }

  const bodyCopy = { ...body, user_id: user_id };

  const reservation = await Reservations.create(bodyCopy);
  try {
    await sendReservationRequestMessage(email,reservation)
  } catch (error) {
    console.log("Error to send message");
    
  }
 

  return res
    .status(201)
    .json({ status: 201, message: "Your reservation is successfully added" });
});

router.get("/:id", checkJWT, userExists, isClient, async (req, res) => {
  const id = req.params.id;
  const token = getToken(req);
  const { user_id } = decodeJWT(token);
  const reservation = await Reservations.findOne({
    where: {
      reservation_id: id,
    },
  });

  const error = validateReservation(reservation, user_id);
  if (error) {
    const status = error.status
    return res.status(status).json(error)
  }

  return res.json({ status: 200, body: reservation });
});

router.put("/:id", checkJWT, userExists, isClient, async (req, res) => {
  const id = req.params.id;
  const reservation = await Reservations.findOne({
    where: {
      reservation_id: id,
    },
  });

  if (!reservation) {
    return res
      .status(404)
      .json({ status: 400, message: "Reservation not found" });
  }

  const token = getToken(req);
  const { user_id, email } = decodeJWT(token);
  const body = req.body;

  const error = validate(body, reservationValidator);

  if (error) return res.status(401).json(error);

  if (reservation.user_id !== user_id) {
    return res
      .status(401)
      .json({ status: 401, message: "You cannot edit this reservation" });
  }

  await updateReservation(reservation, body);

  try {
    await sendReservationUpdatingMessage(reservation,email)
  } catch (error) {
    console.log("Error to send a message");
    
  }
  

  return res.json({
    status: 200,
    message: "The reservation has been successfully changed",
  });
});

router.put("/reject/:id", checkJWT, userExists, isAdmin, async (req, res) => {
  acceptOrRejectReservation(req, res, false);
});

router.put("/accept/:id", checkJWT, userExists, isAdmin, async (req, res) => {
  acceptOrRejectReservation(req, res);
});

router.delete("/:id", checkJWT, userExists, isClient, async (req, res) => {
  const id = req.params.id;
  const reservation = await Reservations.findOne({
    where: {
      reservation_id: id,
    },
  });

  if (!reservation)
    return res
      .status(404)
      .json({ status: 404, message: "Reservation not found" });

  const token = getToken(req);
  const { user_id } = decodeJWT(token);

  if (reservation.user_id !== user_id)
    return res
      .status(401)
      .json({ status: 401, message: "You cannot delete this reservation" });

  await Reservations.destroy({
    where: {
      reservation_id: id,
    },
  });

  return res.json({
    status: 200,
    message: `Reservation ${id} is successfully deleted`,
  });
});

module.exports = router;
