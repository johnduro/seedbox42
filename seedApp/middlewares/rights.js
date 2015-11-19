
module.exports = {
	admin: function (req, res, next) {
		if (req.user.role === 0)
			next();
		else
			res.json({ success: false, message: "You don't have enought rights for this action" });
	},

	adminOrUserParam: function (req, res, next) {
		if (req.user.role == 0 || req.user._id == req.params.id)
			next();
		else
			res.json({ success: false, message: "You don't have enought rights for this action" });
	}
};
