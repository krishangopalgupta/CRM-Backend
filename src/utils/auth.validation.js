



// import AppError from "./AppError";
// // Manually Validation of fields
// const validateRequiredFields = (object, fields) => {
//   for (const field of fields) {
//     if (!object[field]) {
//       throw new AppError(`${field} is required`, 400);
//     }
//   }
// };

// export { validateRequiredFields };

// Manually Check Validation

//  It comes from auth.services.js and we used it to check the validation it only check like undefined, null, 0, "", false that's it not email: @gmail.com, password:12 thats why we need ZOD validator
//   validateRequiredFields(organization, [
//     "orgName",
//     "orgEmail",
//     "orgPhone",
//     "orgAddress",
//   ]);
//   validateRequiredFields(user, ["name", "email", "phone", "password"]);
