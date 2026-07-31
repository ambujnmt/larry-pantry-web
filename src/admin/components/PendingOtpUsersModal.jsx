import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DataTable from 'datatables.net-react'
import DT from 'datatables.net-bs5'
import Swal from "sweetalert2"
import { activatePendingOtpUser, dtOptions,} from "../../utils/adminApi"

DataTable.use(DT)

function PendingOtpUsersModal({
  users,
  onClose,
  onActivated,
  onRefresh,
}) {
  const [processing, setProcessing] = useState(null)

  const handleActivate = async (user) => {
    const result = await Swal.fire({
      title: "Activate User?",
      text: `Activate "${user.first_name} ${user.last_name}" manually?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Activate",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0e606c",
    })

    if (!result.isConfirmed) return

    try {
      setProcessing(user.id)

      await activatePendingOtpUser(user.id)

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "User activated successfully.",
        timer: 1800,
        showConfirmButton: false,
      })

      onActivated(user.id)
      if (onRefresh) {
			  await onRefresh()
			}
    } catch (err) {
      Swal.fire(
        "Error",
        err.message || "Failed to activate user.",
        "error"
      )
    } finally {
      setProcessing(null)
    }
  }

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">

            <div
              className="modal-header"
              style={{ background: "#0e606c" }}
            >
              <div>
                <h5 className="modal-title text-white mb-0">
                  <i className="fa fa-envelope me-2" />
                  Pending OTP Verification
                </h5>

                <small
                  style={{
                    color: "rgba(255,255,255,.75)"
                  }}
                >
                  {users.length} pending user(s)
                </small>
              </div>

              <button
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>

            <div className="modal-body p-2">

              {users.length === 0 ? (

                <div className="text-center py-5 text-muted">
                  No pending OTP users found.
                </div>

              ) : (

                <DataTable
                  key={users.length}
                  className="table table-hover mb-0 w-100 table-bordered"
                  options={{
                    ...dtOptions,
                    destroy: true,
                    pageLength: 10,
                    responsive: true,
                    order: [[4, "desc"]],
                    columnDefs: [
                      {
                        orderable: false,
                        targets: [5],
                      },
                    ],
                  }}
                >

                  <thead className="table-light">

                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Registered</th>
                      <th width="130">
                        Action
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {users.map((u, index) => (

                      <tr key={u.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {[u.first_name, u.last_name]
                            .filter(Boolean)
                            .join(" ")}
                        </td>

                        <td>
                          {u.email}
                        </td>

                        <td>
                          {u.mobile || "—"}
                        </td>

                        <td>
                          {new Date(
                            u.created_at
                          ).toLocaleString()}
                        </td>

                        <td>

                          <button
                            className="btn btn-success btn-sm"
                            disabled={
                              processing === u.id
                            }
                            onClick={() =>
                              handleActivate(u)
                            }
                          >
                            {processing === u.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Activating...
                              </>
                            ) : (
                              <>
                                {/*<i className="fa fa-check me-2" />*/}
                                Activate
                              </>
                            )}
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </DataTable>

              )}

            </div>

            <div className="modal-footer">

              <button
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>

            </div>

          </div>
        </div>
      </div>

      <div
        className="modal-backdrop fade show"
        onClick={onClose}
      />
    </>
  )
}

export default PendingOtpUsersModal