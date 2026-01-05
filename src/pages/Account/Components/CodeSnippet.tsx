import {
  Box,
  Button,
  CircularProgress,
  Modal,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {ContentCopy, OpenInFull} from "@mui/icons-material";
import SyntaxHighlighter from "react-syntax-highlighter";
import {getPublicFunctionLineNumber, transformCode} from "../../../utils";
import {useEffect, useRef, useState} from "react";
import StyledTooltip, {
  StyledLearnMoreTooltip,
} from "../../../components/StyledTooltip";
import {
  solarizedLight,
  solarizedDark,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  codeBlockColor,
  codeBlockColorRgbDark,
  codeBlockColorRgbLight,
  grey,
} from "../../../themes/colors/aptosColorPalette";
import {useParams} from "react-router-dom";
import {useLogEventWithBasic} from "../hooks/useLogEventWithBasic";
import {useGetModuleVerificationStatus} from "../../../api/hooks/useGetModuleVerificationStatus";
import {ResponseErrorType} from "../../../api/client";

function useStartingLineNumber(sourceCode?: string) {
  const functionToHighlight = useParams().selectedFnName;

  if (!sourceCode) return 0;
  if (!functionToHighlight) return 0;

  return getPublicFunctionLineNumber(sourceCode, functionToHighlight);
}

function ExpandCode({sourceCode}: {sourceCode: string | undefined}) {
  const theme = useTheme();
  const {selectedModuleName} = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const logEvent = useLogEventWithBasic();

  const handleOpenModal = () => {
    logEvent("expand_button_clicked", selectedModuleName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const startingLineNumber = useStartingLineNumber(sourceCode);
  const codeBoxScrollRef = useRef<{scrollTop: number} | null>(null);
  const LINE_HEIGHT_IN_PX = 24;
  useEffect(() => {
    if (codeBoxScrollRef.current) {
      codeBoxScrollRef.current.scrollTop =
        LINE_HEIGHT_IN_PX * startingLineNumber;
    }
  });

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={handleOpenModal}
        disabled={!sourceCode}
        sx={{
          height: "2rem",
          width: "2rem",
          minWidth: "unset",
          borderRadius: 0,
        }}
      >
        <OpenInFull style={{height: "1.25rem", width: "1.25rem"}} />
      </Button>
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "80%",
            width: "80%",
            overflowY: "auto",
            borderRadius: 0,
          }}
          ref={codeBoxScrollRef}
        >
          <SyntaxHighlighter
            language="rust"
            key={theme.palette.mode}
            style={
              theme.palette.mode === "light" ? solarizedLight : solarizedDark
            }
            customStyle={{
              margin: 0,
              backgroundColor:
                theme.palette.mode === "light"
                  ? codeBlockColorRgbLight
                  : codeBlockColorRgbDark,
            }}
            showLineNumbers
          >
            {sourceCode!}
          </SyntaxHighlighter>
        </Box>
      </Modal>
    </Box>
  );
}

/** Displays source code only if bytecode verification succeeds. */
export function Code({
  bytecode,
  address,
  moduleName,
}: {
  bytecode: string;
  address?: string;
  moduleName?: string;
}) {
  const {selectedModuleName} = useParams();
  const logEvent = useLogEventWithBasic();
  const theme = useTheme();

  // Use the module name from props or from URL params
  const moduleNameToVerify = moduleName || selectedModuleName || "";

  // Query verification status
  const {
    data: verificationStatus,
    isLoading: isVerificationLoading,
    error: verificationError,
  } = useGetModuleVerificationStatus(address || "", moduleNameToVerify, {
    enabled: !!address && !!moduleNameToVerify,
  });

  const TOOLTIP_TIME = 2000; // 2s

  const sourceCode = bytecode === "0x" ? undefined : transformCode(bytecode);

  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  async function copyCode() {
    if (!sourceCode) return;

    await navigator.clipboard.writeText(sourceCode);
    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, TOOLTIP_TIME);
  }

  const startingLineNumber = useStartingLineNumber(sourceCode);
  const codeBoxScrollRef = useRef<{scrollTop: number} | null>(null);
  const LINE_HEIGHT_IN_PX = 24;
  useEffect(() => {
    if (codeBoxScrollRef.current) {
      codeBoxScrollRef.current.scrollTop =
        LINE_HEIGHT_IN_PX * startingLineNumber;
    }
  });

  // Check if code should be shown:
  // - If verification is disabled (SERVICE_UNAVAILABLE) or loading, don't show code
  // - If verified = true, show code
  // - If verified = false or NOT_FOUND, don't show code
  const isVerified = verificationStatus?.verified === true;
  const shouldShowCode = sourceCode && isVerified;

  // Determine the message to show when code is not displayed
  const getNoCodeMessage = () => {
    if (isVerificationLoading) {
      return null; // Will show loading spinner
    }
    if (verificationError) {
      if (verificationError.type === ResponseErrorType.SERVICE_UNAVAILABLE) {
        return "Source code is not available because verification is not enabled on this node.";
      }
      if (verificationError.type === ResponseErrorType.NOT_FOUND) {
        return "Source code is not available.";
      }
      return "Unable to verify source code.";
    }
    if (!sourceCode) {
      return "Unfortunately, the source code cannot be shown because the package publisher has chosen not to make it available.";
    }
    if (verificationStatus?.verified === false) {
      return "Source code is not available because it does not match the deployed bytecode.";
    }
    return "Source code is not available.";
  };

  return (
    <Box>
      <Stack
        direction="row"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Stack
          direction="row"
          spacing={1}
          marginY={"16px"}
          alignItems={"center"}
        >
          <Typography fontSize={20} fontWeight={700}>
            Code
          </Typography>
        </Stack>
        {shouldShowCode && (
          <Stack direction="row" spacing={2}>
            <StyledTooltip
              title="Code copied"
              placement="right"
              open={tooltipOpen}
              disableFocusListener
              disableHoverListener
              disableTouchListener
            >
              <Button
                variant="outlined"
                onClick={() => {
                  logEvent("copy_code_button_clicked", selectedModuleName);
                  copyCode();
                }}
                disabled={!sourceCode}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: "2rem",
                  borderRadius: "0rem",
                }}
              >
                <ContentCopy style={{height: "1.25rem", width: "1.25rem"}} />
                <Typography
                  marginLeft={1}
                  sx={{
                    display: "inline",
                    whiteSpace: "nowrap",
                  }}
                >
                  copy code
                </Typography>
              </Button>
            </StyledTooltip>
            <ExpandCode sourceCode={sourceCode} />
          </Stack>
        )}
      </Stack>
      {isVerificationLoading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          padding={4}
        >
          <CircularProgress size={24} />
          <Typography marginLeft={2}>Verifying source code...</Typography>
        </Box>
      ) : shouldShowCode ? (
        <Box
          sx={{
            maxHeight: "100vh",
            overflow: "auto",
            borderRadius: 0,
            backgroundColor: codeBlockColor,
          }}
          ref={codeBoxScrollRef}
        >
          <SyntaxHighlighter
            language="rust"
            key={theme.palette.mode}
            style={
              theme.palette.mode === "light" ? solarizedLight : solarizedDark
            }
            customStyle={{margin: 0, backgroundColor: "unset"}}
            showLineNumbers
          >
            {sourceCode}
          </SyntaxHighlighter>
        </Box>
      ) : (
        <Box
          padding={2}
          bgcolor={theme.palette.mode === "dark" ? grey[800] : grey[100]}
        >
          <Typography color={grey[500]}>{getNoCodeMessage()}</Typography>
        </Box>
      )}
    </Box>
  );
}
