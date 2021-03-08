/* eslint-disable react/jsx-wrap-multilines */
import React, { useEffect, useRef, useState, useCallback, FC } from 'react';
import { KeyboardTypeOptions, TextInput, useWindowDimensions } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { COLOUR } from '../../../common/constants';

import { SmallText } from '../../presentation/typography';
import { Column, FlexPaddingView } from '../../layouts';

import { SettingsEditModal } from './SettingsEditModal';

interface SettingsTextEditModalProps {
  title: string;
  onConfirm: ({ inputValue }: { inputValue: string }) => void;
  initialValue: string;
  validation: any;
  keyboardType?: KeyboardTypeOptions;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsTextEditModal: FC<SettingsTextEditModalProps> = ({
  title,
  onConfirm,
  initialValue,
  validation,
  keyboardType = 'default',
  isOpen,
  onClose,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);

  const { width } = useWindowDimensions();

  return (
    <Formik
      onSubmit={() => {
        // Keep formik types happy?
      }}
      initialValues={{ input: inputValue }}
      validationSchema={Yup.object().shape({ input: validation })}
    >
      {({ handleChange, errors, values, isValid }) => {
        const wrappedOnConfirm = useCallback(() => isValid && onConfirm({ inputValue }), [
          isValid,
          inputValue,
        ]);
        const textInputRef = useRef<TextInput | null>(null);

        useEffect(() => {
          setTimeout(() => textInputRef.current?.focus(), 100);
        }, [textInputRef.current, isOpen]);

        return (
          <SettingsEditModal
            onClose={onClose}
            isOpen={isOpen}
            title={title}
            onConfirm={wrappedOnConfirm}
            isDisabled={!isValid}
            Content={
              <Column alignItems="center" justifyContent="center">
                {isOpen && (
                  <TextInput
                    ref={ref => {
                      textInputRef.current = ref;
                    }}
                    value={values.input}
                    underlineColorAndroid={COLOUR.GREY_ONE}
                    style={{ width: width * 0.5 }}
                    onChangeText={e => {
                      setInputValue(e);
                      handleChange('input')(e);
                    }}
                    numberOfLines={1}
                    onSubmitEditing={wrappedOnConfirm}
                    keyboardType={keyboardType}
                  />
                )}
                {errors.input ? (
                  <SmallText colour={COLOUR.DANGER}>{errors.input}</SmallText>
                ) : (
                  <FlexPaddingView height={15} />
                )}
              </Column>
            }
          />
        );
      }}
    </Formik>
  );
};
