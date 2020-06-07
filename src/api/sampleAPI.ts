import { IRequest, IResponse } from "../core/types"

export default <Req extends IRequest<{}, {}, {}>, Res extends IResponse<{}>>(request: Req): Promise<Res> => {
  return fetch("", {
    method: request.type
  }).then(res => res.json())
}
