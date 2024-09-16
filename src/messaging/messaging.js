const { transport } = require("../conf/conf");
const path = require("path");
const fsPromise = require("fs/promises");

const FROM_NAME = '"reservations_application@email.com" <jnr.31gcharlieedokpa@gmail.com>'

let bookHtml, acceptHtml, changeHtml, rejectHtml

const getData = async (relativeRoute) => {
  return await fsPromise.readFile(
    path.join(__dirname, relativeRoute),
    "utf8"
  );
}

const loadHtmls = async() => {
  bookHtml = await getData("public/html/book.html")
  acceptHtml = await getData("public/html/accept.html")
  rejectHtml = await getData("public/html/reject.html")
  changeHtml = await getData("public/html/change.html")
}

loadHtmls()


const createEmail = (email, subject, reservation, html,image) => {
  return {
    from: FROM_NAME, // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: `Reservation ${reservation.reservation_id}`, // plain text body
    html: html, // html body
    attachments: addImage(image),
  };
}

const replaceVariables = (html, reservation) => {
  html = html.replace("{{reservation_id}}", reservation.reservation_id);
  html = html.replace("{{people}}", reservation.people);
  html = html.replace("{{date}}", reservation.date);
  html = html.replace("{{time}}", reservation.time);
  html = html.replace("{{status}}", reservation.status)
  return html;
}

const addImage = (image) => {
  const [name] = image.split(".")
  return {
    filename:image,
    path: path.join(__dirname, `public/images/${image}`),
    cid: `${name}@image.cid`
  }
  
}



const sendReservationRequestMessage = async (email, reservation) => {
  bookHtml = replaceVariables(bookHtml, reservation);
  transport.sendMail(createEmail(email,"Your reservation is requested", reservation, bookHtml,"silverware.jpg"));
};


const sendReservationRejectMessage = async(reservation,note,email) => {
  rejectHtml = note && note.length != 0 ? rejectHtml.replace("{{reason}}",`Reason: ${note}`) : rejectHtml.replace("{{reason}}","")

  transport.sendMail(createEmail(email,"Your reservation is rejected",reservation,rejectHtml,"cross.jpg"))
}

const sendReservationAcceptMessage = async(reservation,note,email) => {

  acceptHtml = note && note.length != 0 ? acceptHtml.replace("{{note}}",`Note: ${note}`) : acceptHtml.replace("{{note}}","")
  acceptHtml = replaceVariables(acceptHtml,reservation)

  transport.sendMail(createEmail(email,"Your reservation is accepted",reservation,acceptHtml,"tick.jpg"))
}


const sendReservationUpdatingMessage = async(reservation, email) => {
  changeHtml = replaceVariables(changeHtml,reservation)
  transport.sendMail(createEmail(email,"Your reservation is changed",reservation,changeHtml,"calendar.jpg"))
}

module.exports = { sendReservationRequestMessage,sendReservationRejectMessage,sendReservationAcceptMessage, sendReservationUpdatingMessage };




