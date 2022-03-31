import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Task from 'App/Models/Task'
export default class TasksController {
  public async index({ view, auth }: HttpContextContract) {
    const user = auth.user
    await user?.preload('tasks')
    return view.render('tasks/index', { tasks: user?.tasks })
  }
  public async store({ request, response, session, auth }: HttpContextContract) {
    const validationSchema = schema.create({
      title: schema.string({ trim: true }, [rules.maxLength(255)]),
    })
    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'title.required': 'Enter task title',
        'title.maxLength': 'Task title cannot exceed 255 char',
      },
    })
    await Task.create({
      title: validatedData.title,
      userId: auth.user?.id,
    })
    session.flash('notification', 'Task Added')
    return response.redirect('back')
  }
  public async update({ request, response, session, params }) {
    const task = await Task.findOrFail(params.id)
    task.is_completed = !!request.input('completed') //get from checkbox
    await task.save()
    session.flash('notification', 'Task Updated Successfully')
    return response.redirect('back')
  }
  public async destroy({ params, response, session }) {
    const task = await Task.findOrFail(params.id)

    await task.delete()
    session.flash('notification', 'Task Deleted Successfully')
    return response.redirect('back')
  }
}
