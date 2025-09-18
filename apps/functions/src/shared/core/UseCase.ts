export interface UseCase<IRequest, IResponse> {
  execute(request?: IRequest): Promise<IResponse> | IResponse;
}

export interface StripeUseCase<IRequest, IResponse> {
  execute(request: IRequest, connectedAccountId: string): Promise<IResponse> | IResponse;
}

export interface UseCaseWithAuth<Dto, IResponse> {
  execute(request: Dto, uid: string): Promise<IResponse> | IResponse;
}
