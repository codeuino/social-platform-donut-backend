const Project = require('../models/Project')

module.exports = {
  createProject: async (req, res, next) => {
    const project = new Project(req.body)
    try {
      await project.save()
      res.send(project)
    } catch (error) {
      console.log(error)
      res.status(400).json({ error: error })
    }
  },
  projectInfo: async (req, res, next) => {
      try {
        const projects = await Project.find({})
        if( projects.length == 0 ) {
            res.send("No projects exists!")
        } else {
            res.send(projects);
        }
      } catch (error) {
        console.log(error)
        res.status(404).json({ error: error })
      }
  },
  projectInfoUpdate: async (req, res, next) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['projectName', 'description', 'image', 'imgUrl', 'version', 'links', 'contributors', ' maintainers']
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
      return res.status(400).json({ error: 'invalid update' })
    }

    try {
        const project = await Project.findByIdAndUpdate({_id:req.params.id},req.body,{ new:true, runValidators:true});
        if(!project) {
            throw new Error("No such project Exists!");
        } else {
            res.send(project);
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({ error: error })
      }
  },
  projectDelete: async (req, res, next) => {
    try {
        const project = await Project.findByIdAndDelete({ _id:req.params.id })
        if(!project) {
            throw new Error("No such project exists")
        } else { 
            res.send(project);
        }
    } catch (error) {
      console.log(error)
      res.status(404).json({ error: error })
    }
}
}
