const register = (req, res)=>{
res.status(200).json({
    message : "user registered"
})
}
module.exports = {register};