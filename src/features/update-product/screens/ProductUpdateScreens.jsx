import React, { useState, memo, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, Redirect } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { RiErrorWarningLine } from 'react-icons/ri';
import { BsTrash } from 'react-icons/bs';

import NoResult from 'assets/images/no-result.png';

import {
  WrapPage,
  Title,
  WrapForm,
  ContentForm,
  FormLeft,
  FormRight,
  WrapButton,
  ListImage,
  GroupStudents,
  GroupInput,
  GroupLabel,
  TetailItem,
  DemoAvatar,
  Overlay,
  GroupNoResult,
} from './ProductUpdateScreen.styles';
import {
  DataConvert,
  DataConvertStudent,
} from '../helpers/add-product.helpers';
import InputElement from 'components/FormElement/InputElement/InputElement';
import InputFileElement from 'components/FormElement/InputElement/InputFileElement';
import SelectElement from 'components/FormElement/SelectElement/SelectElement';
import CKEditor from '../components/editor/CKEditor';
import { WarEditor } from '../components/editor/Editor.styles';
import { MapOptions } from 'helpers/convert/map-options';
import { STATUS_KEY_INPUT } from '../constants/update-product.key';
import { getProductType } from 'features/master-data/redux/master-data.slice';

import { getDetailProduct, removeImage,UpdateProduct } from '../redux/update-product.slice';
import Loading from 'components/Loading/Loading';

const AddProduct = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();

  useEffect(() => {
    dispatch(getProductType());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getDetailProduct(id));
    }
  }, [dispatch, id]);

  const { userLogin, productDetail, loading, listProductType } = useSelector(
    (state) => ({
      userLogin: state.auth?.userLogin,
      productDetail: state.updateProduct?.productDetail,
      loading: state.updateProduct?.loading,
      listProductType: state.masterData?.listProductType,
    })
  );
  const dataConvertProduct = DataConvert(productDetail);
  const dataConvertStudent = DataConvertStudent(productDetail);

  let ArrayGalleris =
    productDetail &&
    productDetail.product_galleries.map((item) => {
      return item.image_url;
    });
  const [listImages, setListImage] = useState([]);
  const [linkAvatar, setLinkAvatar] = useState(null);

  const [LinkDoc, setLinkDoc] = useState(null);
  const [loadingButton, setLoadingButton] = useState(0);
  const [disableButton, setDisableButton] = useState(false);

  const [hiden, setHiden] = useState(true);
  const [hidenStudent, setHidenStudent] = useState(true);
  const [reviewAvatar, setReviewAvatar] = useState(false);
  const selectProductTypes = MapOptions(listProductType ?? []);

  let email = [];
  const [groupCodeStudent, setGroupCodeStudent] = useState([]);

  const remove = (i) => {
    if (groupCodeStudent.length > 0) {
      setGroupCodeStudent(groupCodeStudent.filter((_, index) => index !== i));
      setHidenStudent(false);
    } else {
      setGroupCodeStudent(dataConvertStudent.filter((_, index) => index !== i));
    }
  };

  const RemoveImage = async (i, key) => {
    const url = { img_url: i };
    try {
      await dispatch(removeImage(url));
      if (listImages && listImages.length > 0) {
        setListImage(listImages.filter((_, index) => index !== key));
        setHiden(false);
      } else {
        setListImage(ArrayGalleris.filter((_, index) => index !== key));
      }
    } catch (error) {}
  };

  const EmailChange = (e, key) => {
    const valueEmail = e.target.value;
    email = [...groupCodeStudent];
    email[key] = valueEmail;
    setGroupCodeStudent(email);
  };
  const popupWindow = (url, title, w, h) => {
    var left = window.screen.width / 2 - w / 2;
    var top = window.screen.height / 2 - h / 2;
    return window.open(
      url,
      title,
      `toolbar=no, location=no,directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`
    );
  };
  if(!userLogin?.id){
      return <Redirect to="/" />
  }
  if (loading || productDetail === null) {
    return <Loading />;
  }
  return (
    <>
      {productDetail === undefined ? (
        <GroupNoResult>
          <div className="body-no-result">
            <img src={NoResult} alt="" className="img-no-result" />
            <div className="box-no-result">
              <div className="label-no-result">Không tìm thấy kết quả nào</div>
            </div>
          </div>
        </GroupNoResult>
      ) : (
        <>
        {productDetail?.status === 0 || productDetail?.status === 1 ?
          <WrapPage className="container">
            {userLogin?.id === productDetail?.user_id ||
            userLogin?.id === productDetail?.master_user ||
            userLogin?.id === productDetail?.teacher_id ? (
              <>
                <Title title> Cập nhật sản phẩm </Title>
                <WrapForm>
                  <Formik
                    initialValues={dataConvertProduct}
                    onSubmit={async (values, { rest }) => {
                      const newObjProduct = { ...rest };
                      newObjProduct.name = values.name
                        ? values.name
                        : dataConvertProduct.name;
                      newObjProduct.description = values.description
                        ? values.description
                        : dataConvertProduct.description;
                      newObjProduct.class = dataConvertProduct.class;
                      newObjProduct.video_url = values.video_url
                        ? values.video_url
                        : dataConvertProduct.video_url;
                      newObjProduct.students =
                        groupCodeStudent.length > 0
                          ? groupCodeStudent
                          : dataConvertStudent;
                      newObjProduct.galleries =
                        listImages.length > 0 ? listImages : ArrayGalleris;
                      newObjProduct.email = userLogin.email;
                      newObjProduct.image_url = linkAvatar
                        ? linkAvatar
                        : dataConvertProduct.image;
                      newObjProduct.resource_url = LinkDoc
                        ? LinkDoc
                        : dataConvertProduct.resource_url;
                      newObjProduct.status = 1;
                      newObjProduct.description = values.description ;
                      newObjProduct.product_type_id =
                        values.product_type_id;

                      setLoadingButton(STATUS_KEY_INPUT.LOADING);
                      setDisableButton(true);
                      let data = {
                        newObjProduct: newObjProduct,
                        id: id,
                      };
                      const response = await dispatch(UpdateProduct(data))
                      if (UpdateProduct.fulfilled.match(response)) {
                        toast.success('Cập nhật sản phẩm thành công');
                        setLoadingButton(STATUS_KEY_INPUT.DEFAULT);
                        setDisableButton(false)
                        setTimeout(
                          () => history.push(`/product/${id}`),
                          1000
                        );
                      } else {
                        toast.error('Cập nhật sản phẩm thất bại !');
                        setLoadingButton(STATUS_KEY_INPUT.ERROR);
                        setDisableButton(false);
                      }
                      setDisableButton(false);
                    }}
                  >
                    {() => (
                      <Form encType="multipart/form-data">
                        <ContentForm>
                          <FormLeft>
                            <InputElement
                              label="Tên sản phẩm"
                              name="name"
                              placeholder="Nhập tên sản phẩm"
                            />
                            <InputElement
                              label="Đường dẫn video"
                              name="video_url"
                              placeholder="Link video "
                            />
                            <GroupLabel className="group-label">
                              <InputElement
                                label="Môn Học  "
                                name="subject_id"
                                hidden
                              />
                              <div className="text-label">
                                {productDetail?.subject?.name}
                              </div>
                            </GroupLabel>
                            <GroupLabel className="group-label">
                              <InputElement
                                label="Giảng viên"
                                name="teacher_id"
                                hidden
                              />
                              <div className="text-label">
                                {productDetail?.teacher?.name}
                              </div>
                            </GroupLabel>

                            <GroupLabel className="group-label">
                              <InputElement
                                label="Kì học"
                                name="semester_id"
                                placeholder="Kỳ học"
                                hidden
                              />
                              <div className="text-label">
                                {productDetail?.semester?.name}
                              </div>
                            </GroupLabel>

                            <GroupStudents>
                              <Title className="title">Thành viên</Title>
                              {groupCodeStudent.length > 0 ? (
                                <>
                                  <GroupInput>
                                    {groupCodeStudent.map((item, index) => {
                                      return (
                                        <div className="group" key={index}>
                                          <input
                                            className="inputE"
                                            type="text"
                                            placeholder="Tên và mã số sinh viên "
                                            value={item}
                                            required
                                            onChange={(e) =>
                                              EmailChange(e, index)
                                            }
                                          />
                                          <button
                                            className="remove"
                                            type="button"
                                            onClick={() => remove(index)}
                                            disabled={
                                              groupCodeStudent.length === 1
                                            }
                                          >
                                            <BsTrash />
                                          </button>
                                        </div>
                                      );
                                    })}
                                    <button
                                      type="button"
                                      className="add"
                                      onClick={() => {
                                        setGroupCodeStudent([
                                          ...groupCodeStudent,
                                          '',
                                        ]);
                                      }}
                                    >
                                      Thêm +
                                    </button>
                                  </GroupInput>{' '}
                                </>
                              ) : (
                                <>
                                  {/* groupCodeStudent  không tồn tại  */}
                                  {hidenStudent && (
                                    <>
                                      <GroupInput>
                                        {dataConvertStudent.map(
                                          (item, index) => {
                                            return (
                                              <div
                                                className="group"
                                                key={index}
                                              >
                                                <input
                                                  className="inputE"
                                                  type="text"
                                                  placeholder="Tên và mã số sinh viên "
                                                  value={item}
                                                  required
                                                  onChange={(e) =>
                                                    EmailChange(e, index)
                                                  }
                                                />
                                                <button
                                                  className="remove"
                                                  type="button"
                                                  onClick={() => remove(index)}
                                                  disabled={
                                                    dataConvertStudent.length ===
                                                    1
                                                  }
                                                >
                                                  <BsTrash />
                                                </button>
                                              </div>
                                            );
                                          }
                                        )}
                                        <button
                                          type="button"
                                          className="add"
                                          onClick={() => {
                                            setGroupCodeStudent([
                                              ...dataConvertStudent,
                                              '',
                                            ]);
                                          }}
                                        >
                                          Thêm +
                                        </button>
                                      </GroupInput>
                                    </>
                                  )}
                                </>
                              )}
                            </GroupStudents>

                            <SelectElement
                              label="Loại"
                              name="product_type_id"
                              placeholder="Loại sản phẩm"
                              options={selectProductTypes || []}
                            />
                            <InputFileElement
                              name="image_url"
                              label="Ảnh đại diện"
                              id="file-avatar"
                              content="Chọn ảnh đại diện"
                              linkAvatar={linkAvatar}
                              setLinkAvatar={setLinkAvatar}
                            />
                            {!linkAvatar && (
                              <TetailItem onClick={() => setReviewAvatar(true)}>
                                Xem avatar{' '}
                              </TetailItem>
                            )}
                            {reviewAvatar && (
                              <DemoAvatar>
                                <img src={dataConvertProduct.image} alt="" />
                                <Overlay onClick={() => setReviewAvatar(false)}>
                                  {' '}
                                </Overlay>
                              </DemoAvatar>
                            )}
                            <InputFileElement
                              name="resource_url"
                              label="Tài liệu"
                              id="file-document"
                              content="Chọn tài liệu"
                              setLinkDoc={setLinkDoc}
                              LinkDoc={LinkDoc}
                            />
                            {!LinkDoc && (
                              <TetailItem
                                onClick={() =>
                                  popupWindow(
                                    dataConvertProduct?.resource_url,
                                    'Tài liệu',
                                    '600',
                                    '600'
                                  )
                                }
                              >
                                Xem tài liệu
                              </TetailItem>
                            )}
                            <InputFileElement
                              name="galleries"
                              label="Hình ảnh"
                              id="file-gallery"
                              content={
                                listImages && listImages.length > 0 ? (
                                  `Danh sách ảnh  ${listImages.length} `
                                ) : (
                                  <>
                                    {' '}
                                    {hiden ? (
                                      <>
                                        {' '}
                                        {ArrayGalleris
                                          ? ` Danh sách ảnh ${ArrayGalleris.length} `
                                          : 'Chọn bộ sưu tập'}{' '}
                                      </>
                                    ) : (
                                      <> Chọn bộ sưu tập </>
                                    )}
                                  </>
                                )
                              }
                              multiple
                              setListImage={setListImage}
                              listImages={listImages}
                              disabled={listImages && listImages.length >= 6}
                            />

                            {/*  list hình ảnh  */}
                            <ListImage>
                              {listImages && listImages.length > 0 ? (
                                listImages.map((item, index) => {
                                  return (
                                    <div className="box-item" key={index}>
                                      <img src={item} alt="" />
                                      <div className="delete">
                                        <BsTrash
                                          onClick={() =>
                                            RemoveImage(item, index)
                                          }
                                        />
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <>
                                  {/*  ẩn sản phẩm */}
                                  {hiden && (
                                    <>
                                      {ArrayGalleris &&
                                        ArrayGalleris.map((item, index) => {
                                          return (
                                            <div
                                              className="box-item"
                                              key={index}
                                            >
                                              <img src={item} alt="" />
                                              <div className="delete">
                                                <BsTrash
                                                  onClick={() =>
                                                    RemoveImage(item, index)
                                                  }
                                                />
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </>
                                  )}
                                </>
                              )}
                            </ListImage>
                          </FormLeft>

                          <FormRight>
                            <WarEditor>
                              <CKEditor data={productDetail?.description} />
                            </WarEditor>
                          </FormRight>
                        </ContentForm>
                        <WrapButton>
                          {/* <label onClick={() => setShow(!show)} className="review">
                  Xem trước
                </label> */}

                          <button
                            disabled={
                           disableButton
                            }
                            type="submit"
                            className={`button-add ${
                              loadingButton === STATUS_KEY_INPUT.ERROR && 'er'
                            }`}
                          >
                            {loadingButton === STATUS_KEY_INPUT.LOADING && (
                              <div className="loader"></div>
                            )}
                            {loadingButton === STATUS_KEY_INPUT.ERROR && (
                              <div className="error">
                                <RiErrorWarningLine />
                              </div>
                            )}
                            Cập nhật sản phẩm
                          </button>
                        </WrapButton>
                      </Form>
                    )}
                  </Formik>
                </WrapForm>
                <ToastContainer position="top-right" autoClose={1500} />
              </>
            ) : (
              <Redirect to="/" />
            )}
          </WrapPage>
          :   <Redirect to="/" /> }
        </>
      )}
    </>
  );
};

export default memo(AddProduct);
