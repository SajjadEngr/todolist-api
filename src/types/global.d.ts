interface IResultService {
  message: string;
  status: 200 | 201 | 400 | 401 | 404 | 500;
  data?: any;
}
