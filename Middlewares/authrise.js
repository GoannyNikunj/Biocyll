const authrised = (permittedRoles) => {
  return (req, res, next) => {
    const userRole = req.body.user.roll; // Fix the typo here

    console.log(userRole);

    if (permittedRoles.includes(userRole)) {
      next();
    } else {
      return res.status(401).json({ message: "you are not authorized" }); // Send a proper unauthorized response
    }
  };
};

module.exports = {
  authrised,
};

