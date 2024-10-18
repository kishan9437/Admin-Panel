import { useState } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { useNavigate, useParams } from 'react-router-dom'
import { resetPassword } from '../core/_requests'

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
})

export function ResetPassword() {
  const { resetPasswordToken } = useParams<{ resetPasswordToken: string }>()
  const [loading, setLoading] = useState(false)
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined)
  const navigate = useNavigate()
  // console.log('reset token: ' + token)
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      setLoading(true)
      setHasErrors(undefined)

      // console.log(ResetPasswordSchema)
      if (!resetPasswordToken) {
        setHasErrors(true)
        setStatus('Invalid token')
        setLoading(false)
        return
      }
    //   console.log(token)
      resetPassword(resetPasswordToken, values.password)
        .then((response) => {
          setLoading(false)
          const { success, message } = response.data
          console.log(response)
          if (success) {
            // Redirect to login or show success message
            navigate('/auth/login')

          } else {
            setHasErrors(true)
            setStatus(message)
            // console.log(message)
          }
        })
        .catch(() => {
          setHasErrors(true)
          setLoading(false)
          setSubmitting(false)
          setStatus('An error occurred while resetting your password.')
        })
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <h1 className='text-gray-900 fw-bolder mb-3'>Reset Password</h1>

      {hasErrors && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>
            Sorry, looks like there are some errors detected, please try again.
          </div>
        </div>
      )}

      {/* Password Field */}
      <div className='mb-4'>
        <label className='form-label'>New Password</label>
        <input
          type='password'
          {...formik.getFieldProps('password')}
          className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
        />
        {formik.touched.password && formik.errors.password && (
          <div className='invalid-feedback'>{formik.errors.password}</div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className='mb-4'>
        <label className='form-label'>Confirm Password</label>
        <input
          type='password'
          {...formik.getFieldProps('confirmPassword')}
          className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div className='invalid-feedback'>{formik.errors.confirmPassword}</div>
        )}
      </div>

      {/* Submit Button */}
      <div className='d-flex flex-wrap justify-content-center pb-lg-0'>
        <button type='submit' className='btn btn-primary me-4' disabled={loading}>
          <span className='indicator-label'>Reset Password</span>
          {loading && <span className='spinner-border spinner-border-sm ms-2'></span>}
        </button>
      </div>
    </form>
  )
}
